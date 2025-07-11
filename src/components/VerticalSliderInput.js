import { useRef, useEffect, useState, useCallback } from 'react';

export function VerticalSliderInput({ value, min, max, onChange }) {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const getRelativeValue = useCallback((e) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    const percent = (rect.bottom - clientY) / rect.height;
    const clampedPercent = Math.min(Math.max(percent, 0), 1);
    const newValue = min + clampedPercent * (max - min);
    return Math.round(newValue * 10) / 10;
  }, [min, max]);

  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    const newValue = getRelativeValue(e);
    onChange(newValue);
  }, [getRelativeValue, onChange]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const newValue = getRelativeValue(e);
    onChange(newValue);
  }, [isDragging, getRelativeValue, onChange]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={sliderRef}
      className="vertical-meter"
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      style={{ touchAction: 'none' }}
    >
      <div
        className="vertical-meter-fill"
        style={{
          height: `${percent}%`,
        }}
      />
    </div>
  );
}