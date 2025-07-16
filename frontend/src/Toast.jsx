import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  let color = 'bg-blue-600';
  if (type === 'error') color = 'bg-red-600';
  if (type === 'success') color = 'bg-green-600';

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded shadow-lg text-white ${color} flex items-center gap-3 min-w-[250px] max-w-[90vw]`}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">&times;</button>
    </div>
  );
} 