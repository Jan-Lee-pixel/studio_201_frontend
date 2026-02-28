"use client";

import { useState, useEffect, useRef } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export function FeedbackModal({ open, onClose, onSubmitSuccess }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const resetForm = () => {
    setRating(0);
    setHoveredStar(0);
    setComment("");
    setSubmitting(false);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);

    // Simulate backend call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    console.log("[Feedback Submitted]", { rating, comment });

    resetForm();
    onClose();
    onSubmitSuccess();
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  if (!open) return null;

  const displayRating = hoveredStar || rating;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ animation: "fadeIn 250ms ease forwards" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(26,24,20,0.6)] backdrop-blur-[2px]"
        onClick={handleClose}
        aria-hidden
      />

      {/* Modal panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Leave your feedback"
        className="relative bg-[var(--color-bone)] w-full max-w-md rounded-sm shadow-[0_24px_64px_rgba(0,0,0,0.3)] overflow-hidden"
        style={{ animation: "slideUpModal 400ms var(--ease-out-expo) forwards" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-2">
          <h2 className="font-display text-xl text-[var(--color-near-black)]">
            Share Your Experience
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close feedback form"
            className="p-1.5 rounded-sm text-[var(--color-warm-slate)] hover:text-[var(--color-near-black)] transition-colors duration-200 cursor-pointer disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <p className="px-7 pb-4 font-body text-sm text-[var(--color-warm-slate)]">
          We value your thoughts. Let us know how your visit was.
        </p>

        {/* Star rating */}
        <div className="px-7 pb-5">
          <label className="block font-mono text-[10px] text-[var(--color-dust)] tracking-[0.1em] uppercase mb-3">
            Rating
          </label>
          <div className="flex gap-1.5" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                disabled={submitting}
                className="p-1 cursor-pointer transition-transform duration-150 hover:scale-110 disabled:cursor-not-allowed"
              >
                <Star
                  size={26}
                  className="transition-colors duration-200"
                  fill={star <= displayRating ? "var(--ochre)" : "transparent"}
                  stroke={star <= displayRating ? "var(--ochre)" : "var(--dust)"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          {rating === 0 && (
            <p className="mt-2 font-body text-xs text-[var(--color-dust)]">
              Tap a star to rate
            </p>
          )}
        </div>

        {/* Textarea */}
        <div className="px-7 pb-6">
          <label
            htmlFor="feedback-comment"
            className="block font-mono text-[10px] text-[var(--color-dust)] tracking-[0.1em] uppercase mb-3"
          >
            Your Thoughts
          </label>
          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            placeholder="Tell us about your experience..."
            rows={4}
            className="w-full bg-[var(--color-parchment)] border border-[var(--color-rule)] rounded-sm px-4 py-3 font-body text-sm text-[var(--color-near-black)] placeholder:text-[var(--color-dust)] resize-none focus:outline-none focus:border-[var(--color-warm-slate)] transition-colors duration-200 disabled:opacity-50"
          />
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 flex items-center justify-between">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="font-body text-xs tracking-[0.06em] uppercase text-[var(--color-warm-slate)] hover:text-[var(--color-near-black)] transition-colors duration-200 cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Sending…" : "Submit Feedback"}
          </Button>
        </div>
      </div>
    </div>
  );
}
