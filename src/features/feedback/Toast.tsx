"use client";

import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
}

export function Toast({ message, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[10000] flex items-center gap-3 bg-[var(--color-near-black)] text-[var(--color-cream)] px-5 py-4 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.25)] font-body text-sm tracking-wide"
      style={{ animation: "toastSlideIn 400ms var(--ease-out-expo) forwards" }}
    >
      <CheckCircle size={18} className="text-[var(--color-ochre)] shrink-0" />
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="ml-2 p-1 rounded-sm text-[var(--color-dust)] hover:text-[var(--color-cream)] transition-colors duration-200 cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}
