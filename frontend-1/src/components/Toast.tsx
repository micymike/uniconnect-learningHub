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
      {message}
      <button
        className="ml-4 text-white font-bold"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
