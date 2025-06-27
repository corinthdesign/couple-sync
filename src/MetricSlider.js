import { useState } from 'react';

export default function MetricSlider({ title = "METRIC TITLE", initialValue = 85, color = "#ff69b4" }) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(Number(e.target.value));
  };

  return (
    <div className="relative w-full max-w-md h-14 flex items-center gap-4">
      {/* Icon */}
      <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black">
        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Slider Container */}
      <div className="relative w-full h-10 rounded-full overflow-hidden">
        {/* Slider background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gray-300 rounded-full" />

        {/* Filled slider */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />

        {/* Text overlay */}
        <div className="absolute inset-0 flex justify-between items-center px-4 font-bold text-white text-md">
          <span>{title}</span>
          <span>{value}%</span>
        </div>

        {/* Range input (transparent layer over everything) */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
