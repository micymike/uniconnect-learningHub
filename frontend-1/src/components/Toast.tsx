import React, { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
};

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  let bg = "bg-blue-600";
  if (type === "success") bg = "bg-green-600";
  if (type === "error") bg = "bg-red-600";

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded shadow-lg text-white font-semibold ${bg} animate-fade-in`}
      style={{ minWidth: 200 }}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <div>
          <button
            className="ml-4 px-2 py-1 bg-white/20 rounded text-white font-bold hover:bg-white/30 transition"
            onClick={onClose}
            aria-label="Clear notification"
          >
            Clear
          </button>
          <button
            className="ml-2 text-white font-bold text-xl"
            onClick={onClose}
            aria-label="Close"
            style={{ lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
