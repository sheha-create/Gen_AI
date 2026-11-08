import React, { useEffect, useState, useRef } from 'react';
import { formatRupees } from '../utils/money';

interface OdometerProps {
  amountPaise: number;
  className?: string;
  size?: 'normal' | 'hero' | 'total';
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const RollingDigit: React.FC<{ char: string }> = ({ char }) => {
  if (!DIGITS.includes(char)) {
    return <span>{char}</span>;
  }

  const num = parseInt(char, 10);

  return (
    <span
      className="inline-block relative overflow-hidden align-baseline"
      style={{ height: '1.05em', lineHeight: '1.05em', width: '0.62em' }}
    >
      <span
        className="block transition-transform duration-200 ease-out"
        style={{ transform: `translateY(-${num * 10}%)` }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="block text-center" style={{ height: '1.05em' }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
};

export const Odometer: React.FC<OdometerProps> = ({
  amountPaise,
  className = '',
  size = 'normal',
}) => {
  const formatted = formatRupees(amountPaise);
  const [announcement, setAnnouncement] = useState(`Total ${formatted}`);
  const lastAnnounced = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastAnnounced.current >= 800) {
      setAnnouncement(`Total ${formatted}`);
      lastAnnounced.current = now;
    } else {
      const timer = setTimeout(() => {
        setAnnouncement(`Total ${formatted}`);
        lastAnnounced.current = Date.now();
      }, 800 - (now - lastAnnounced.current));
      return () => clearTimeout(timer);
    }
  }, [formatted]);

  return (
    <span
      className={`font-tape font-tabular inline-flex items-baseline select-none ${className}`}
      aria-label={`Total ${formatted}`}
    >
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {formatted.split('').map((ch, idx) => (
          <RollingDigit key={idx} char={ch} />
        ))}
      </span>
    </span>
  );
};
