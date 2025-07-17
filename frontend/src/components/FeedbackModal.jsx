import React, { useState } from "react";
import axios from "../services/api";
import { useConfirm } from "./useConfirm";

export default function FeedbackModal({ open, onClose, student }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(student?.email || "");
  const [name, setName] = useState(student?.name || "");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, ConfirmModal] = useConfirm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    if (!window.confirm('Are you sure you want to send this feedback?')) return;
    setLoading(true);
    try {
      await axios.post("/api/feedback", {
        subject,
        message,
        email: email || undefined,
        student_name: name || undefined,
      });
      setSuccess("Feedback sent successfully!");
      setSubject(""); setMessage("");
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
      else setErrors({ general: "An error occurred. Please try again." });
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Send Feedback</h2>
        {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}
        {errors.general && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{errors.general}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Subject</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              minLength={3}
            />
            {errors.subject && <div className="text-red-600 text-sm">{errors.subject[0]}</div>}
          </div>
          <div>
            <label className="block font-medium">Message</label>
            <textarea
              className="w-full border rounded px-3 py-2 mt-1"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              minLength={10}
              rows={4}
            />
            {errors.message && <div className="text-red-600 text-sm">{errors.message[0]}</div>}
          </div>
          <div>
            <label className="block font-medium">Email (optional)</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
            />
            {errors.email && <div className="text-red-600 text-sm">{errors.email[0]}</div>}
          </div>
          <div>
            <label className="block font-medium">Name (optional)</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {errors.student_name && <div className="text-red-600 text-sm">{errors.student_name[0]}</div>}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
        {ConfirmModal}
      </div>
    </div>
  );
} 