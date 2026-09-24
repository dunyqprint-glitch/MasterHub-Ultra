import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. AI Coach Advice Endpoint
app.post("/api/coach/advice", async (req: Request, res: Response) => {
  try {
    const {
      goalName,
      category,
      completionRate,
      streak,
      todayStep,
      mood,
      note,
      antiGoals,
      isMinMode,
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Intelligent fallback when API key is not configured
      let advice = "";
      if (isMinMode) {
        advice = "🌱 โหมดเพดานต่ำสุดทำงาน: โฟกัสเฉพาะภารกิจเดียวก่อน อย่าเพิ่งกดดันตัวเอง ความสม่ำเสมอชนะความสมบูรณ์แบบเสมอ!";
      } else if (completionRate === 100) {
        advice = `🏆 ยอดเยี่ยมระดับอัลตรา! คุณทำเป้าหมาย "${goalName}" สำเร็จครบ 100% แล้ว รักษาระดับวินัยนี้เพื่อก้าวสู่เป้าหมายต่อไป`;
      } else if (streak >= 7) {
        advice = `🔥 คุณสะสม Streak ได้ถึง ${streak} วันติดแล้ว! พลังโมเมนตัมกำลังสูงสุด โฟกัสงานวันนี้: "${todayStep || goalName}" ให้สำเร็จอีกก้าว`;
      } else {
        advice = `⚡ โค้ชเตือนสติ: โฟกัสงานวันนี้ "${todayStep || goalName}" แบ่งเป็นก้อนเล็กๆ 25 นาที ลุยทันทีไม่ต้องรอพร้อม!`;
      }
      res.json({ advice, source: "local" });
      return;
    }

    const prompt = `
คุณคือ "AI Master Coach ระดับอัลตรา" สำหรับผู้ประกอบการและผู้พัฒนาตนเอง
ข้อมูลปัจจุบันของผู้ใช้:
- ชื่องาน/เป้าหมาย: "${goalName || "ไม่ระบุ"}" (หมวด: ${category === "work" ? "งานธุรกิจ/ร้านค้า" : "วินัย/ส่วนตัว"})
- อัตราความสำเร็จ: ${completionRate}%
- สตรีคสะสม: ${streak} วันติดต่อกัน
- ภารกิจวันนี้: "${todayStep || "ไม่มีภารกิจกำหนดเจาะจง"}"
- อารมณ์/พลังงานวันนี้: ${mood || "ปกติ"}
- บันทึกส่วนตัววันนี้: "${note || "ไม่มี"}"
- Anti-Goals (สิ่งที่จะเลี่ยงไม่ทำ): ${antiGoals && antiGoals.length > 0 ? antiGoals.join(", ") : "ไม่มี"}
- โหมดเพดานต่ำสุด (Min Mode): ${isMinMode ? "เปิดอยู่ (ต้องการความเรียบง่าย ไม่กดดัน)" : "ปิด"}

คำสั่ง:
เขียนคำแนะนำเชิงโค้ชชิ่งที่เฉียบคม ปลุกพลัง และให้แนวทางปฏิบัติที่ชัดเจน 2-3 ประโยค (ไม่เกิน 60 คำ) เป็นภาษาไทย ใช้โทนมืออาชีพ เป็นมิตร หนักแน่น และมีจิตวิทยาเสริมแรงเชิงบวก
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "คุณคือ AI Master Coach โค้ชผู้บริหารและวินัยชั้นยอด ตอบภาษาไทยกระชับ คมคาย กระตุ้นให้ลงมือทำทันที",
      },
    });

    const text = response.text?.trim() || "ตั้งสมาธิกับเป้าหมายสำคัญของวันนี้ แล้วลุยทีละสเต็ป!";
    res.json({ advice: text, source: "gemini" });
  } catch (error: any) {
    console.error("Coach advice error:", error);
    res.json({
      advice: "⚡ คำแนะนำ: เริ่มต้นด้วยงานชิ้นเล็กที่สุดในลิสต์ ใช้กฎ 2 นาทีในการเริ่มทำ แล้วความต่อเนื่องจะตามมาเองครับ!",
      source: "fallback",
    });
  }
});

// 3. AI Smart Task Breakdown
app.post("/api/coach/breakdown", async (req: Request, res: Response) => {
  try {
    const { title, category, days = 14, startDate } = req.body;

    const baseDate = startDate ? new Date(startDate) : new Date();
    const count = Math.min(Math.max(Number(days) || 7, 3), 365);

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback generator
      const steps = [];
      for (let i = 1; i <= count; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + (i - 1));
        const dateStr = d.toISOString().split("T")[0];
        steps.push({
          id: Date.now() + i,
          text: `วันที่ ${i}: ${title} (ช่วงที่ ${Math.ceil((i / count) * 4)})`,
          date: dateStr,
          completed: false,
        });
      }
      res.json({
        steps,
        executiveSummary: `แผนการปฏิบัติการ ${count} วันสำหรับ "${title}"`,
        source: "local",
      });
      return;
    }

    const prompt = `
สร้างแผนย่อยขั้นตอนรายวันสำหรับเป้าหมาย: "${title}"
หมวดหมู่: ${category === "work" ? "งานธุรกิจ / ร้านค้า" : "วินัย / ส่วนตัว"}
จำนวนวันที่ต้องการ: ${count} วัน เริ่มตั้งแต่วันที่ ${baseDate.toISOString().split("T")[0]}

ให้สร้างขั้นตอนการกระทำที่เป็นรูปธรรม (Actionable Steps) แต่ละวันมีความก้าวหน้าอย่างเป็นระบบ (ช่วงเริ่มต้น -> วางรากฐาน -> เร่งสปีด -> ตรวจทานและขยายผล)
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: "บทสรุปกลยุทธ์สั้นๆ 1 ประโยค",
            },
            dailySteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  actionTitle: {
                    type: Type.STRING,
                    description: "ชื่องานปฏิบัติการกระชับ ชัดเจน",
                  },
                },
                required: ["dayNumber", "actionTitle"],
              },
            },
          },
          required: ["executiveSummary", "dailySteps"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const steps = (parsed.dailySteps || []).map((step: any, idx: number) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + idx);
      return {
        id: Date.now() + idx + 1,
        text: `วันที่ ${step.dayNumber || idx + 1}: ${step.actionTitle}`,
        date: d.toISOString().split("T")[0],
        completed: false,
      };
    });

    // If AI returned fewer steps than requested, pad or ensure complete list
    if (steps.length === 0) {
      for (let i = 1; i <= count; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + (i - 1));
        steps.push({
          id: Date.now() + i,
          text: `วันที่ ${i}: ดำเนินการตามแผน ${title}`,
          date: d.toISOString().split("T")[0],
          completed: false,
        });
      }
    }

    res.json({
      steps,
      executiveSummary: parsed.executiveSummary || `แผนการดำเนินงาน ${count} วัน`,
      source: "gemini",
    });
  } catch (error: any) {
    console.error("AI breakdown error:", error);
    // Safe graceful fallback
    const count = Math.min(Math.max(Number(req.body.days) || 7, 3), 365);
    const baseDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
    const steps = [];
    for (let i = 1; i <= count; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (i - 1));
      steps.push({
        id: Date.now() + i,
        text: `วันที่ ${i}: ${req.body.title}`,
        date: d.toISOString().split("T")[0],
        completed: false,
      });
    }
    res.json({
      steps,
      executiveSummary: `แผนปฏิบัติการ ${count} วันสำหรับ ${req.body.title}`,
      source: "fallback",
    });
  }
});

// 4. Interactive AI Master Coach Chat
app.post("/api/coach/chat", async (req: Request, res: Response) => {
  try {
    const { message, history = [], currentContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        reply: "คำแนะนำจาก Master Coach: การบริหารงานและวินัยที่ยอดเยี่ยมเริ่มจากการตัดสิ่งไม่จำเป็นออก จัดลำดับความสำคัญตาม Eisenhower Matrix (สำคัญ vs เร่งด่วน) แล้วลงมือทำสิ่งสำคัญอันดับ 1 ก่อนสิ่งอื่นใดครับ!",
      });
      return;
    }

    const systemInstruction = `
คุณคือ "AI Master Coach ระดับอัลตรา" ที่ปรึกษาส่วนตัวด้านกลยุทธ์ธุรกิจและวินัยระดับสูง
บริบทของผู้ใช้:
${currentContext ? JSON.stringify(currentContext) : "กำลังบริหารเป้าหมายธุรกิจและวินัยส่วนตัว"}

บุคลิก:
- คมคาย ให้เกียรติ มั่นใจ มีกลยุทธ์ นำหลักวิทยาศาสตร์พฤติกรรมและการจัดการระดับสากลมาประยุกต์
- ตอบภาษาไทย เข้าใจง่าย กระชับ ตรงประเด็น ไม่เยิ่นเย้อ
- ให้คำแนะนำที่สามารถนำไปทำได้จริงทันที (Action-oriented)
`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({
      reply: response.text?.trim() || "ขออภัย ไม่สามารถประมวลผลคำตอบได้ในขณะนี้",
    });
  } catch (error: any) {
    console.error("Coach chat error:", error);
    res.status(500).json({
      reply: "ระบบให้คำปรึกษาขัดข้องชั่วคราว ลองเริ่มจากตั้งสมาธิกับงานชิ้นแรกของวันก่อนนะครับ",
    });
  }
});

// Mount Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MasterHub Ultra server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
