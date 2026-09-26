'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';

interface TextRotatorProps {
  texts?: string[];
  interval?: number;
  className?: string;
}

const defaultTexts = [
  'User Experience Designer',
  'Product Designer',
  'UI Designer',
  'Design Thinker',
  'Creative Problem Solver',
];

export default function TextRotator({
  texts = defaultTexts,
  interval = 3000,
  className = '',
}: TextRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [texts, interval]);

  return (
    <span
      aria-live="polite"
      className={clsx('relative inline-block w-screen max-w-full overflow-hidden', className)}
      style={{ height: '1.2em', minWidth: '150px' }}
    >
      {texts.map((text, index) => (
        <span
          key={index}
          className={clsx(
            'absolute top-0 left-0 block w-full transition-opacity transition-transform duration-700 ease-in-out',
            index === currentIndex ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            transform: `translateY(${(index - currentIndex) * 100}%)`,
          }}
        >
          {text}
        </span>
      ))}
    </span>
  );
}
