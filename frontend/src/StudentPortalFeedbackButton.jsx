import React, { useState } from "react";
import FeedbackModal from "./components/FeedbackModal";

export default function StudentPortalFeedbackButton({ student }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        Send Feedback
      </button>
      <FeedbackModal open={open} onClose={() => setOpen(false)} student={student} />
    </>
  );
} 