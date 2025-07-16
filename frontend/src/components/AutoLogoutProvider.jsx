import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

export default function AutoLogoutProvider({ children }) {
  const navigate = useNavigate();
  const timer = useRef();

  // Show toast (replace with your toast system if needed)
  function showToast(msg) {
    // You can use a real toast library here
    alert(msg);
  }

  function logout(reason = "Session expired. Please log in again") {
    localStorage.removeItem("token");
    showToast(reason);
    navigate("/login");
  }

  function resetTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => logout(), INACTIVITY_LIMIT);
  }

  useEffect(() => {
    // Activity events
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Expose for axios interceptor
  window.handleSessionExpiry = () => logout();

  return children;
} 