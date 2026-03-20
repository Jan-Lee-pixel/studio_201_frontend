"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { mediaAssetService } from "@/features/mediaAssets/services/mediaAssetService";
import { portfolioService } from "@/features/portfolio/services/portfolioService";
import {
  ARTWORK_CATEGORY_OPTIONS,
  getArtTypeDraft,
  getArtTypeOptions,
  resolveArtTypeValue,
} from "@/features/artworks/constants/categories";

const PORTFOLIO_BUCKET = "studio201-public";
const MAX_FILE_SIZE_MB = 20;

const portfolioSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    category: z.string().min(1, "Select a category"),
    artType: z.string().optional(),
    artTypeCustom: z.string().optional(),
    description: z.string().optional(),
    year: z.string().optional(),
    medium: z.string().optional(),
    dimensions: z.string().optional(),
    isPublic: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "Other") {
      if (!data.artTypeCustom?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["artTypeCustom"],
          message: "Enter the type of art",
        });
      }
      return;
    }

    if (!data.artType?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["artType"],
        message: "Select a type of art",
      });
      return;
    }

    if (data.artType === "Other" && !data.artTypeCustom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["artTypeCustom"],
        message: "Enter the type of art",
      });
    }
  });

type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface PortfolioFormProps {
  token: string;
  artistId: string;
  authUserId: string;
  onSuccess: () => void;
}

function getDefaultValues(): PortfolioFormData {
  const artTypeDraft = getArtTypeDraft("", "");
  return {
    title: "",
    category: "",
    artType: artTypeDraft.artType,
    artTypeCustom: artTypeDraft.artTypeCustom,
    description: "",
    year: "",
    medium: "",
    dimensions: "",
    isPublic: true,
  };
}

export function PortfolioForm({ token, artistId: _artistId, authUserId, onSuccess }: PortfolioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: getDefaultValues(),
  });

  const selectedCategory = watch("category");
  const selectedArtType = watch("artType");
  const artTypeOptions = getArtTypeOptions(selectedCategory);

  useEffect(() => {
    if (!selectedCategory) {
      setValue("artType", "");
      setValue("artTypeCustom", "");
      return;
    }

    if (selectedCategory === "Other") {
      setValue("artType", "");
      return;
    }

    if (selectedArtType && !artTypeOptions.includes(selectedArtType)) {
      setValue("artType", "");
      setValue("artTypeCustom", "");
    }

    if (selectedArtType !== "Other") {
      setValue("artTypeCustom", "");
    }
  }, [artTypeOptions, selectedArtType, selectedCategory, setValue]);

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
          category: data.category.trim(),
          artType: resolveArtTypeValue(data.category, data.artType, data.artTypeCustom),
          description: data.description,
          year: data.year,
          medium: data.medium,
          dimensions: data.dimensions,
          isPublic: data.isPublic ?? true,
          mediaAssetId,
        },
        token
      );

      reset(getDefaultValues());
      setSelectedFile(null);
      onSuccess();
    } catch (error) {
      console.error("Portfolio upload failed:", error);
      setErrorMsg("Failed to add artwork to portfolio. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    reset(getDefaultValues());
    setSelectedFile(null);
    setErrorMsg(null);
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
        {errorMsg ? (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded font-dm-mono">
            {errorMsg}
          </div>
        ) : null}

        <div className="form-group">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(event) => {
              if (event.target.files && event.target.files.length > 0) {
                setSelectedFile(event.target.files[0]);
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
                <div
                  className="upload-icon"
                  style={{ color: "var(--terracotta)", borderColor: "var(--terracotta)" }}
                >
                  ✓
                </div>
                <p className="upload-text" style={{ color: "var(--terracotta)" }}>
                  {selectedFile.name}
                </p>
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
            {errors.title ? (
              <p className="text-red-500 text-xs mt-1 font-dm-mono">{errors.title.message}</p>
            ) : null}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register("category")}
              className={`form-select ${errors.category ? "border-red-500" : ""}`}
              defaultValue=""
            >
              <option value="">Select a category</option>
              {ARTWORK_CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className="text-red-500 text-xs mt-1 font-dm-mono">{errors.category.message}</p>
            ) : null}
          </div>
        </div>
        <div style={{ height: "14px" }}></div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Type of Art <span className="text-red-500">*</span>
            </label>
            {selectedCategory === "Other" ? (
              <>
                <input
                  {...register("artTypeCustom")}
                  className={`form-input ${errors.artTypeCustom ? "border-red-500" : ""}`}
                  type="text"
                  placeholder="e.g. Handmade illustration"
                />
                {errors.artTypeCustom ? (
                  <p className="text-red-500 text-xs mt-1 font-dm-mono">
                    {errors.artTypeCustom.message}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <select
                  {...register("artType")}
                  className={`form-select ${errors.artType ? "border-red-500" : ""}`}
                  disabled={!selectedCategory}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {selectedCategory ? "Select a type of art" : "Select a category first"}
                  </option>
                  {artTypeOptions.map((artType) => (
                    <option key={artType} value={artType}>
                      {artType}
                    </option>
                  ))}
                </select>
                {errors.artType ? (
                  <p className="text-red-500 text-xs mt-1 font-dm-mono">{errors.artType.message}</p>
                ) : null}
                {selectedArtType === "Other" ? (
                  <>
                    <div style={{ height: "10px" }}></div>
                    <input
                      {...register("artTypeCustom")}
                      className={`form-input ${errors.artTypeCustom ? "border-red-500" : ""}`}
                      type="text"
                      placeholder="Enter the type of art"
                    />
                    {errors.artTypeCustom ? (
                      <p className="text-red-500 text-xs mt-1 font-dm-mono">
                        {errors.artTypeCustom.message}
                      </p>
                    ) : null}
                  </>
                ) : null}
              </>
            )}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Year</label>
            <input {...register("year")} className="form-input" type="text" placeholder="e.g. 2026" />
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
              placeholder="e.g. Acrylic on canvas"
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

        <div
          className="card-footer"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "24px",
            padding: 0,
            borderTop: "none",
          }}
        >
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear} disabled={isSubmitting}>
            Clear
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Add to Portfolio"}
          </button>
        </div>
      </form>
    </div>
  );
}
