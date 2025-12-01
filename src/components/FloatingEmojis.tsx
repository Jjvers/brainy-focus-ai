import { useEffect, useState } from 'react';

interface Emoji {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

const FloatingEmojis = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  useEffect(() => {
    const emojiList = ['☁️', '⭐', '📚', '✨', '📖', '🌟', '☁️', '💙', '📘', '⭐'];
    const generatedEmojis: Emoji[] = [];

    for (let i = 0; i < 12; i++) {
      generatedEmojis.push({
        id: i,
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10,
        size: 1.5 + Math.random() * 1.5,
      });
    }

    setEmojis(generatedEmojis);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="absolute animate-float-up opacity-60"
          style={{
            left: `${emoji.left}%`,
            animationDelay: `${emoji.delay}s`,
            animationDuration: `${emoji.duration}s`,
            fontSize: `${emoji.size}rem`,
            bottom: '-100px',
          }}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingEmojis;
