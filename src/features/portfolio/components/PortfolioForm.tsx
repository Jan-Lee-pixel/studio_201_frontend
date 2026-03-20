"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { mediaAssetService } from "@/features/mediaAssets/services/mediaAssetService";
import { portfolioService } from "@/features/portfolio/services/portfolioService";
import { ARTWORK_CATEGORY_OPTIONS } from "@/features/artworks/constants/categories";

const PORTFOLIO_BUCKET = "studio201-public";
const MAX_FILE_SIZE_MB = 20;

const portfolioSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  category: z.string().optional(),
  description: z.string().optional(),
  year: z.string().optional(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  isPublic: z.boolean().optional(),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface PortfolioFormProps {
  token: string;
  artistId: string;
  authUserId: string;
  onSuccess: () => void;
}

export function PortfolioForm({ token, artistId, authUserId, onSuccess }: PortfolioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      isPublic: true,
    },
  });

  const onSubmit = async (data: PortfolioFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);

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

        const filePath = `artists/portfolio/${authUserId}/${uuid}.${extension}`;
        const uploadResult = await supabase.storage
          .from(PORTFOLIO_BUCKET)
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
        const { data: publicData } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(filePath);
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
              await supabase.storage.from(PORTFOLIO_BUCKET).remove([uploadedFilePath]);
            }
            throw error;
          });

        mediaAssetId = mediaAsset.id;
      } else {
        setErrorMsg("Please choose an artwork image.");
        setIsSubmitting(false);
        return;
      }

      await portfolioService.createPortfolioItem(
        {
          title: data.title,
          category: data.category?.trim() || undefined,
          description: data.description,
          year: data.year,
          medium: data.medium,
          dimensions: data.dimensions,
          isPublic: data.isPublic ?? true,
          mediaAssetId,
        },
        token
      );

      reset();
      setSelectedFile(null);
      onSuccess();
    } catch (error) {
      console.error("Portfolio upload failed:", error);
      setErrorMsg("Failed to add artwork to portfolio. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" id="portfolio-upload">
      <div className="card-header">
        <h2 className="card-title">Showcase Artwork</h2>
        <span className="artwork-status status-approved" style={{ fontSize: "8px" }}>
          Public portfolio
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card-body">
        {errorMsg && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded font-dm-mono">
            {errorMsg}
          </div>
        )}

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
            <label className="form-label">Category</label>
            <select {...register("category")} className="form-select" defaultValue="">
              <option value="">Select a category</option>
              {ARTWORK_CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ height: "14px" }}></div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Year</label>
            <input
              {...register("year")}
              className="form-input"
              type="text"
              placeholder="e.g. 2026"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Medium</label>
            <input
              {...register("medium")}
              className="form-input"
              type="text"
              placeholder="e.g. Oil on canvas"
            />
          </div>
        </div>
        <div style={{ height: "14px" }}></div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Dimensions</label>
          <input
            {...register("dimensions")}
            className="form-input"
            type="text"
            placeholder="H × W cm"
          />
        </div>
        <div style={{ height: "14px" }}></div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description (optional)</label>
          <textarea
            {...register("description")}
            className="form-textarea"
            placeholder="Short description for the public profile…"
          ></textarea>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-checkbox">
            <input type="checkbox" {...register("isPublic")} defaultChecked />
            <span>Show on public profile</span>
          </label>
        </div>

        <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", padding: 0, borderTop: "none" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { reset(); setSelectedFile(null); }} disabled={isSubmitting}>
            Clear
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading..." : "Add to Portfolio"}
          </button>
        </div>
      </form>
    </div>
  );
}
