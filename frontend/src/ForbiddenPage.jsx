// 403 Forbidden Page
import React from "react";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24">
      <h1 className="text-5xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-lg text-gray-700">You are not authorized to view this page.</p>
    </div>
  );
} 