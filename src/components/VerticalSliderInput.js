import React, { useRef } from 'react';
import '../App.css';

export const VerticalSliderInput = ({ value, min = 0, max = 100, onChange }) => {
  const sliderRef = useRef(null);

  const handleClick = (e) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const percentage = 1 - offsetY / rect.height;
    const newValue = Math.round(min + percentage * (max - min));
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  const capped = Math.max(min, Math.min(max, value));
  const fillPercent = ((capped - min) / (max - min)) * 100;

  return (
    <div
      className="vertical-slider-wrapper"
      onClick={handleClick}
      ref={sliderRef}
    >
      <div className="vertical-meter">
        <div
          className="vertical-meter-fill"
          style={{ height: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
};
