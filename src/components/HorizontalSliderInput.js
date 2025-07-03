import { useRef, useState, useEffect } from 'react';

export function HorizontalSliderInput({
  value,
  onChange,
  min = 0,
  max = 100,
  gradient = 'linear-gradient(to right, #ff62d2, #ff00b7)',
}) {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const calculateValueFromPosition = (clientX) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = relativeX / rect.width;
    const clamped = Math.max(0, Math.min(1, percentage));
    const newValue = Math.round(clamped * (max - min) + min);

    onChange(newValue);
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    calculateValueFromPosition(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      calculateValueFromPosition(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleTouchStart = (e) => {
    setDragging(true);
    calculateValueFromPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (dragging) {
      calculateValueFromPosition(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={containerRef}
      className="horizontal-slider"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className="horizontal-slider-fill"
        style={{
          width: `${percentage}%`,
          background: gradient,
        }}
      />
    </div>
  );
}
