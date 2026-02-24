"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { artworkSubmissionService } from "@/features/submissions/services/artworkSubmissionService";

const submissionSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  year: z.string().optional(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface SubmissionFormProps {
  artistId: string;
  token: string;
  onSuccess: () => void;
}

export function SubmissionForm({ artistId, token, onSuccess }: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
  });

  const onSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    // Combine metadata into description for now until DB schema adds these columns
    const fullDescription = [
      data.year ? `Year: ${data.year}` : "",
      data.medium ? `Medium: ${data.medium}` : "",
      data.dimensions ? `Dimensions: ${data.dimensions}` : "",
      "",
      data.description || "",
    ]
      .filter((s) => s.trim() !== "")
      .join("\n");

    try {
      await artworkSubmissionService.submitArtwork(
        {
          exhibitionId: "00000000-0000-0000-0000-000000000000", // A dummy exhibition ID for unassigned works, or we will need to handle this
          title: data.title,
          description: fullDescription,
        },
        token
      );
      
      reset();
      setSelectedFile(null);
      onSuccess();
    } catch (error) {
      console.error("Submission failed:", error);
      setErrorMsg("Failed to submit artwork. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Submit New Artwork</h2>
        <span className="artwork-status status-review" style={{ fontSize: "8px" }}>
          Curators review weekly
        </span>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card-body">
        {errorMsg && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded font-dm-mono">
            {errorMsg}
          </div>
        )}

        {/* File Upload Zone */}
        <div className="form-group">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedFile(e.target.files[0]);
              }
            }}
            style={{ display: "none" }} 
            accept="image/jpeg, image/png, image/tiff"
          />
          <div 
            className="upload-zone" 
            style={{ 
              cursor: "pointer", 
              borderColor: selectedFile ? "var(--terracotta)" : undefined,
              backgroundColor: selectedFile ? "rgba(224, 122, 95, 0.05)" : undefined,
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <>
                <div className="upload-icon" style={{ color: "var(--terracotta)", borderColor: "var(--terracotta)" }}>✓</div>
                <p className="upload-text" style={{ color: "var(--terracotta)" }}>{selectedFile.name}</p>
                <p className="upload-sub">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB — Click to change file
                </p>
              </>
            ) : (
              <>
                <div className="upload-icon">⬆</div>
                <p className="upload-text">Drop artwork image here or click to browse</p>
                <p className="upload-sub">JPEG, PNG or TIFF — max 20MB — min 2000px on longest edge</p>
              </>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Title <span className="text-red-500">*</span>
            </label>
            <input 
              {...register("title")} 
              className={`form-input ${errors.title ? "border-red-500" : ""}`} 
              type="text" 
              placeholder="Work title" 
            />
            {errors.title && <p className="text-red-500 text-xs mt-1 font-dm-mono">{errors.title.message}</p>}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Year</label>
            <input 
              {...register("year")} 
              className="form-input" 
              type="text" 
              placeholder="e.g. 2026" 
            />
          </div>
        </div>
        <div style={{ height: "14px" }}></div>
        
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Medium</label>
            <input 
              {...register("medium")} 
              className="form-input" 
              type="text" 
              placeholder="e.g. Oil on canvas" 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dimensions</label>
            <input 
              {...register("dimensions")} 
              className="form-input" 
              type="text" 
              placeholder="H × W cm" 
            />
          </div>
        </div>
        <div style={{ height: "14px" }}></div>
        
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Artist Statement / Notes for Curators</label>
          <textarea 
            {...register("description")} 
            className="form-textarea" 
            placeholder="Describe the work's context, intent, or any relevant details for the curation team…"
          ></textarea>
          <p className="form-hint">This note is private and shared only with Studio 201 curators.</p>
        </div>

        <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", padding: 0, borderTop: "none" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { reset(); setSelectedFile(null); }} disabled={isSubmitting}>
            Clear
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
