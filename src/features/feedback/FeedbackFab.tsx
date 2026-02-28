"use client";

import { useState, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";
import { Toast } from "./Toast";

export function FeedbackFab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleSubmitSuccess = useCallback(() => {
    setToastVisible(true);
  }, []);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setModalOpen(true)}
        aria-label="Leave feedback"
        id="feedback-fab"
        className="fixed bottom-6 right-6 z-[9990] flex items-center gap-2.5 bg-[var(--color-near-black)] text-[var(--color-cream)] pl-4 pr-5 py-3 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.25,0,0,1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:translate-y-[-2px] group"
        style={{ animation: "fabPulse 600ms var(--ease-out-expo) forwards" }}
      >
        <MessageSquare
          size={16}
          className="transition-transform duration-300 group-hover:scale-110"
        />
        <span className="font-body text-xs tracking-[0.06em] uppercase">
          Feedback
        </span>
      </button>

      {/* Modal */}
      <FeedbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitSuccess={handleSubmitSuccess}
      />

      {/* Success Toast */}
      <Toast
        message="Thank you for your feedback!"
        visible={toastVisible}
        onClose={dismissToast}
      />
    </>
  );
}
