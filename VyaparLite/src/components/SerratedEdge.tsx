import React from 'react';

interface SerratedEdgeProps {
  color?: string; // background color of the teeth, defaults to #ffffff
  direction?: 'down' | 'up';
  toothWidth?: number; // 8px default
  toothHeight?: number; // 6px default
  className?: string;
}

export const SerratedEdge: React.FC<SerratedEdgeProps> = ({
  color = '#ffffff',
  direction = 'down',
  toothWidth = 8,
  toothHeight = 6,
  className = '',
}) => {
  const patternId = React.useId();
  const w = toothWidth * 2; // 16px pattern width (two 8px teeth)
  const h = toothHeight;

  // Downward pointing teeth: polygon from top down
  const points =
    direction === 'down'
      ? `0,0 ${toothWidth},${h} ${w},0`
      : `0,${h} ${toothWidth},0 ${w},${h}`;

  return (
    <div
      className={`w-full overflow-hidden leading-none block select-none pointer-events-none ${className}`}
      style={{ height: `${h}px` }}
      aria-hidden="true"
    >
      <svg width="100%" height={h} className="block w-full">
        <defs>
          <pattern
            id={patternId}
            width={w}
            height={h}
            patternUnits="userSpaceOnUse"
          >
            <polygon points={points} fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height={h} fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};
