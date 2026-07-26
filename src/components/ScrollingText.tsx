import React, { useState, useRef, useEffect } from 'react';

interface ScrollingTextProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollingText: React.FC<ScrollingTextProps> = ({ children, className }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      setOverflowing(el.scrollWidth > el.clientWidth + 2);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const showCarousel = overflowing && hovering;

  return (
    <div
      className={className}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ overflow: 'hidden' }}
    >
      <div
        ref={textRef}
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {showCarousel ? (
          <div className="scrolling-text-track" style={{ animationDuration: `${Math.max(3, (textRef.current?.scrollWidth || 100) / 35)}s` }}>
            <span>{children}</span>
            <span>{children}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
