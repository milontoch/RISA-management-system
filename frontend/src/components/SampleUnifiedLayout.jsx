import React from "react";

export default function SampleUnifiedLayout({ children }) {
  return (
    <div className="min-h-screen bg-oysterglow-bg font-sans">
      <div className="max-w-4xl mx-auto p-layout">
        <div className="bg-oysterglow-surface rounded-lg shadow p-card">
          <h1 className="text-oysterglow-text text-2xl font-bold mb-4">Dashboard</h1>
          <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-800">
            Primary Action
          </button>
          {children}
        </div>
      </div>
    </div>
  );
} 