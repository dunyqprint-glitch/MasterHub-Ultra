import confetti from 'canvas-confetti';

export function fireCelebration(): void {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
    });
  } catch {
    // Graceful fallback if canvas is not ready
  }
}

export function fireMegaMilestone(): void {
  try {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 40 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  } catch {
    // fallback
  }
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
