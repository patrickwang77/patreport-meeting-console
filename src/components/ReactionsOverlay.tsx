import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface FloatingGift {
  id: string;
  emoji: string;
  label: string;
  sender: string;
  left: number;
}

interface ReactionsOverlayProps {
  latestGift: { emoji: string; label: string; sender: string } | null;
  enabled: boolean;
}

export const ReactionsOverlay: React.FC<ReactionsOverlayProps> = ({ latestGift, enabled }) => {
  const [floatingGifts, setFloatingGifts] = useState<FloatingGift[]>([]);

  useEffect(() => {
    if (!enabled || !latestGift) return;

    // Confetti explosion on celebration
    if (latestGift.emoji === '🎉' || latestGift.emoji === '🚀') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85, x: 0.85 }
      });
    }

    const newGift: FloatingGift = {
      id: 'gift-' + Date.now() + '-' + Math.random(),
      emoji: latestGift.emoji,
      label: latestGift.label,
      sender: latestGift.sender,
      left: Math.floor(Math.random() * 30) + 65 // appear in right 65% - 95%
    };

    setFloatingGifts((prev) => [...prev, newGift]);

    const timer = setTimeout(() => {
      setFloatingGifts((prev) => prev.filter((g) => g.id !== newGift.id));
    }, 2200);

    return () => clearTimeout(timer);
  }, [latestGift, enabled]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
      {floatingGifts.map((gift) => (
        <div
          key={gift.id}
          className="absolute bottom-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/40 shadow-xl backdrop-blur-md animate-float-up text-white select-none"
          style={{ left: `${gift.left}%` }}
        >
          <span className="text-2xl">{gift.emoji}</span>
          <div className="text-left text-xs leading-tight">
            <span className="font-bold text-indigo-300 block">{gift.label}</span>
            <span className="text-[10px] text-slate-400">來自: {gift.sender}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
