"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { artworkSubmissionService } from "@/features/submissions/services/artworkSubmissionService";
import { exhibitionService, Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { createClient } from "@/lib/supabase/client";
import { mediaAssetService } from "@/features/mediaAssets/services/mediaAssetService";
import { Skeleton } from "@/components/ui/Skeleton";

const ARTWORK_BUCKET = "studio201-public";
const MAX_FILE_SIZE_MB = 20;

const submissionSchema = z.object({
  exhibitionId: z.string().min(1, "Select an exhibition"),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  year: z.string().optional(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface SubmissionFormProps {
  token: string;
  onSuccess: () => void;
  artistId: string;
}

export function SubmissionForm({ token, onSuccess, artistId }: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loadingExhibitions, setLoadingExhibitions] = useState(true);
  const [exhibitionError, setExhibitionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      exhibitionId: "",
    },
  });

  useEffect(() => {
    let mounted = true;
    setLoadingExhibitions(true);
    setExhibitionError(null);
    exhibitionService
      .getOpenExhibitions()
      .then((data) => {
        if (!mounted) return;
        setExhibitions(data);
      })
      .catch((error) => {
        console.error("Failed to load exhibitions:", error);
        if (mounted) setExhibitionError("Failed to load exhibitions. Please try again.");
      })
      .finally(() => {
        if (mounted) setLoadingExhibitions(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
    const descriptionPayload = fullDescription.trim() ? fullDescription : undefined;

    try {
      let mediaAssetId: string | undefined;
      let uploadedFilePath: string | null = null;

      if (selectedFile) {
        const fileSizeMb = selectedFile.size / (1024 * 1024);
        if (fileSizeMb > MAX_FILE_SIZE_MB) {
          setErrorMsg(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
          setIsSubmitting(false);
          return;
        }

        const extensionFromName = selectedFile.name.split(".").pop();
        const extensionFromType = selectedFile.type?.split("/").pop();
        const extension = extensionFromName || extensionFromType || "jpg";
        const uuid =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const filePath = `artworks/${artistId}/${uuid}.${extension}`;
        const uploadResult = await supabase.storage
          .from(ARTWORK_BUCKET)
          .upload(filePath, selectedFile, {
            contentType: selectedFile.type || "image/jpeg",
            upsert: false,
          });

        if (uploadResult.error) {
          console.error("Upload failed:", uploadResult.error);
          setErrorMsg("Failed to upload artwork image. Please try again.");
          setIsSubmitting(false);
          return;
        }

        uploadedFilePath = filePath;
        const { data: publicData } = supabase.storage.from(ARTWORK_BUCKET).getPublicUrl(filePath);
        const mediaAsset = await mediaAssetService
          .createAsset(
            {
              fileName: selectedFile.name,
              filePath,
              publicUrl: publicData.publicUrl,
              mediaType: selectedFile.type || "image/jpeg",
              altText: data.title,
            },
            token
          )
          .catch(async (error) => {
            if (uploadedFilePath) {
              await supabase.storage.from(ARTWORK_BUCKET).remove([uploadedFilePath]);
            }
            throw error;
          });

        mediaAssetId = mediaAsset.id;
      }

      await artworkSubmissionService.submitArtwork(
        {
          exhibitionId: data.exhibitionId,
          title: data.title,
          description: descriptionPayload,
          mediaAssetId,
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
    <div className="card" id="new-submission">
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
        {exhibitionError && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded font-dm-mono">
            {exhibitionError}
          </div>
        )}

        {/* Exhibition Selector */}
        <div className="form-group">
          <label className="form-label">
            Exhibition <span className="text-red-500">*</span>
          </label>
          {loadingExhibitions ? (
            <div className="mt-2">
              <Skeleton className="h-9 w-full" />
            </div>
          ) : exhibitions.length === 0 ? (
            <div className="text-xs font-dm-mono text-gray-400 uppercase tracking-widest">
              No open exhibitions yet.
            </div>
          ) : (
            <>
              <select
                {...register("exhibitionId")}
                className={`form-select ${errors.exhibitionId ? "border-red-500" : ""}`}
                defaultValue=""
              >
                <option value="" disabled>
                  Select an exhibition
                </option>
                {exhibitions.map((exhibition) => (
                  <option key={exhibition.id} value={exhibition.id}>
                    {exhibition.title}
                  </option>
                ))}
              </select>
              {errors.exhibitionId && (
                <p className="text-red-500 text-xs mt-1 font-dm-mono">
                  {errors.exhibitionId.message}
                </p>
              )}
            </>
          )}
        </div>

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
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting || loadingExhibitions || exhibitions.length === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
