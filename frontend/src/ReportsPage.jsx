import React from 'react';

export default function ReportsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Exams & Results</h2>
      {/* Exam Schedule Placeholder */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Exam Schedule</h3>
        <div className="bg-white border rounded shadow p-4 text-gray-500">[Exam schedule table will go here]</div>
      </div>
      {/* Enter Results Placeholder */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Enter Results</h3>
        <div className="bg-white border rounded shadow p-4 text-gray-500">[Enter results form/table will go here]</div>
      </div>
      {/* View Results Placeholder */}
      <div>
        <h3 className="text-lg font-semibold mb-2">View Results</h3>
        <div className="bg-white border rounded shadow p-4 text-gray-500">[Results view will go here]</div>
      </div>
    </div>
  );
} 