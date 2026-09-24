import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCcw, Lightbulb, ArrowLeft } from 'lucide-react';
import { CoachChatMessage, GoalItem } from '../types';

interface AICoachHubViewProps {
  goals: Record<string, GoalItem>;
  onBackToDashboard: () => void;
}

export const AICoachHubView: React.FC<AICoachHubViewProps> = ({ goals, onBackToDashboard }) => {
  const [messages, setMessages] = useState<CoachChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'สวัสดีครับ! ผมคือ AI Master Coach ประจำ MasterHub Ultra ของคุณ พร้อมให้คำปรึกษาด้านกลยุทธ์ธุรกิจ ยอดขาย การบริหารเวลา และการสร้างวินัยระดับสากล วันนี้มีเรื่องไหนที่อยากให้ช่วยวิเคราะห์หรือวางแผนเป็นพิเศษไหมครับ?',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    '💼 วางแผน 30 วันเพิ่มยอดขายร้านและขยายฐานลูกค้า',
    '🎯 รู้สึกหมดไฟและล้ามาก จะดึงวินัยและความกระตือรือร้นกลับมาอย่างไร',
    '🛑 แนะนำ Anti-Goals สำคัญสำหรับเจ้าของธุรกิจเพื่อหยุดเสียเวลา',
    '⚡ สอนเทคนิคจัดตารางชีวิตไม่ให้งานธุรกิจชนกับเวลาส่วนตัว',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg: CoachChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const activeGoalSummary = Object.values(goals).map((g) => ({
        title: g.title,
        category: g.category,
        total: g.steps?.length || 0,
        completed: g.steps?.filter((s) => s.completed).length || 0,
      }));

      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          currentContext: {
            activeGoalsCount: Object.keys(goals).length,
            goals: activeGoalSummary,
          },
        }),
      });

      const data = await res.json();
      const replyMsg: CoachChatMessage = {
        id: 'reply-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'มุ่งมั่นกับงานสำคัญอันดับหนึ่ง แล้วลุยให้สำเร็จครับ!',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch {
      const fallbackMsg: CoachChatMessage = {
        id: 'reply-err-' + Date.now(),
        role: 'assistant',
        content:
          'คำแนะนำด่วน: เมื่อเจออุปสรรค ให้ซอยงานออกเป็นขั้นย่อย 15 นาที แล้วเริ่มทำทันทีโดยไม่ต้องรอความพร้อม วินัยสร้างได้จากการลงมือทำซ้ำๆ ครับ!',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าหลัก</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                ห้องปรึกษา AI Master Coach
              </h2>
              <span className="text-[10px] text-emerald-500 font-medium">● พร้อมให้คำปรึกษา</span>
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome-reset',
                role: 'assistant',
                content: 'เริ่มการสนทนาใหม่เรียบร้อยครับ มีเป้าหมายไหนที่ต้องการคุยกันตอนนี้ครับ?',
                timestamp: new Date().toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ])
          }
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
          title="เริ่มคุยใหม่"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ล้างแชท</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-5 overflow-y-auto no-scrollbar space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-xs shadow-xs font-medium'
                    : 'bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100 rounded-tl-xs border border-zinc-200/60 dark:border-zinc-700/60'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.role === 'user'
                      ? 'text-zinc-400 dark:text-zinc-500'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 text-xs items-center">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-xs text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                <span
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="p-3 bg-zinc-50/80 dark:bg-zinc-800/40 border-t border-zinc-200/60 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-2">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>คำถามและโจทย์กลยุทธ์แนะนำ:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="text-[11px] bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-300 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 transition shrink-0 cursor-pointer text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800/80 flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์คำถามหรือขอคำแนะนำจากโค้ช AI เช่น 'ช่วยวางแผนสต็อกของร้าน'..."
            className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-3 rounded-2xl transition cursor-pointer flex items-center justify-center shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
