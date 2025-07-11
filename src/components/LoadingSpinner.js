// components/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css'; // We'll define the style below

export default function LoadingSpinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner" />
    </div>
  );
}