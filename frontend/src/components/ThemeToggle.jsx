import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    localStorage.getItem("theme") === "dark" ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches && !localStorage.getItem("theme"))
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      className="px-3 py-1 rounded bg-shadowmauve-surface text-shadowmauve-accent dark:bg-shadowmauve-accent dark:text-shadowmauve-bg transition-colors"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
} 