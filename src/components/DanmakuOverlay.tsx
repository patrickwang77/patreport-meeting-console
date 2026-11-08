import React, { useEffect, useState } from 'react';
import { DanmakuItem } from '../types';

interface DanmakuOverlayProps {
  danmakuList: DanmakuItem[];
  enabled: boolean;
}

export const DanmakuOverlay: React.FC<DanmakuOverlayProps> = ({ danmakuList, enabled }) => {
  const [activeItems, setActiveItems] = useState<{ id: string; text: string; top: number; color: string }[]>([]);

  useEffect(() => {
    if (!enabled) {
      setActiveItems([]);
      return;
    }

    if (danmakuList.length > 0) {
      const latest = danmakuList[danmakuList.length - 1];
      const newItem = {
        id: latest.id,
        text: latest.text,
        top: latest.top || Math.floor(Math.random() * 60) + 10,
        color: latest.color || '#ffffff'
      };

      setActiveItems((prev) => [...prev, newItem]);

      // Remove after animation finishes (7 seconds)
      const timer = setTimeout(() => {
        setActiveItems((prev) => prev.filter((item) => item.id !== latest.id));
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [danmakuList, enabled]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
      {activeItems.map((item) => (
        <div
          key={item.id}
          className="absolute whitespace-nowrap px-4 py-1.5 rounded-full font-bold text-sm md:text-base shadow-lg backdrop-blur-md border border-white/20 select-none animate-danmaku"
          style={{
            top: `${item.top}%`,
            color: item.color,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};
