"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  artworkSubmissionService,
  ArtworkSubmission,
} from "@/features/submissions/services/artworkSubmissionService";
import { exhibitionService, Exhibition } from "@/features/exhibitions/services/exhibitionService";
import {
  ARTWORK_CATEGORY_OPTIONS,
  getArtTypeDraft,
  getArtTypeOptions,
  resolveArtTypeValue,
} from "@/features/artworks/constants/categories";
import { createClient } from "@/lib/supabase/client";
import { mediaAssetService } from "@/features/mediaAssets/services/mediaAssetService";
import { Skeleton } from "@/components/ui/Skeleton";

const ARTWORK_BUCKET = "studio201-public";
const MAX_FILE_SIZE_MB = 20;

const submissionSchema = z
  .object({
    exhibitionId: z.string().min(1, "Select an exhibition"),
    title: z.string().min(1, "Title is required").max(255),
    category: z.string().min(1, "Select a category"),
    artType: z.string().optional(),
    artTypeCustom: z.string().optional(),
    description: z.string().optional(),
    year: z.string().optional(),
    medium: z.string().optional(),
    dimensions: z.string().optional(),
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

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface SubmissionFormProps {
  token: string;
  onSuccess: () => void;
  artistId: string;
  submission?: ArtworkSubmission | null;
  onCancel?: () => void;
}

function parseSubmissionDescription(description?: string | null) {
  const lines = (description || "").split("\n");
  let year = "";
  let medium = "";
  let dimensions = "";
  const noteLines: string[] = [];

  for (const line of lines) {
    if (!year && line.startsWith("Year: ")) {
      year = line.slice("Year: ".length).trim();
      continue;
    }
    if (!medium && line.startsWith("Medium: ")) {
      medium = line.slice("Medium: ".length).trim();
      continue;
    }
    if (!dimensions && line.startsWith("Dimensions: ")) {
      dimensions = line.slice("Dimensions: ".length).trim();
      continue;
    }
    noteLines.push(line);
  }

  return {
    year,
    medium,
    dimensions,
    description: noteLines.join("\n").trim(),
  };
}

function getDefaultValues(submission?: ArtworkSubmission | null): SubmissionFormData {
  const parsed = parseSubmissionDescription(submission?.description);
  const artTypeDraft = getArtTypeDraft(submission?.category, submission?.artType);

  return {
    exhibitionId: submission?.exhibitionId ?? "",
    title: submission?.title ?? "",
    category: submission?.category ?? "",
    artType: artTypeDraft.artType,
    artTypeCustom: artTypeDraft.artTypeCustom,
    description: parsed.description,
    year: parsed.year,
    medium: parsed.medium,
    dimensions: parsed.dimensions,
  };
}

export function SubmissionForm({
  token,
  onSuccess,
  artistId,
  submission,
  onCancel,
}: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loadingExhibitions, setLoadingExhibitions] = useState(true);
  const [exhibitionError, setExhibitionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const isEditing = Boolean(submission);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: getDefaultValues(submission),
  });

  const selectedCategory = watch("category");
  const selectedArtType = watch("artType");
  const artTypeOptions = getArtTypeOptions(selectedCategory);

  useEffect(() => {
    reset(getDefaultValues(submission));
    setSelectedFile(null);
    setErrorMsg(null);
  }, [reset, submission]);

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

    const artTypePayload = resolveArtTypeValue(data.category, data.artType, data.artTypeCustom);
    const fullDescription = [
      data.year ? `Year: ${data.year}` : "",
      data.medium ? `Medium: ${data.medium}` : "",
      data.dimensions ? `Dimensions: ${data.dimensions}` : "",
      "",
      data.description || "",
    ]
      .filter((segment) => segment.trim() !== "")
      .join("\n");
    const descriptionPayload = fullDescription.trim() ? fullDescription : undefined;

    try {
      let mediaAssetId: string | undefined = submission?.mediaAssetId ?? undefined;
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

      if (isEditing && submission) {
        await artworkSubmissionService.updateSubmission(
          submission.id,
          {
            title: data.title,
            category: data.category.trim(),
            artType: artTypePayload,
            description: descriptionPayload,
            mediaAssetId,
          },
          token
        );
      } else {
        await artworkSubmissionService.submitArtwork(
          {
            exhibitionId: data.exhibitionId,
            title: data.title,
            category: data.category.trim(),
            artType: artTypePayload,
            description: descriptionPayload,
            mediaAssetId,
          },
          token
        );
      }

      if (isEditing) {
        onCancel?.();
      } else {
        reset(getDefaultValues());
      }
      setSelectedFile(null);
      onSuccess();
    } catch (error) {
      console.error("Submission failed:", error);
      setErrorMsg(
        isEditing
          ? "Failed to update submission. Please try again."
          : "Failed to submit artwork. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset(getDefaultValues(submission));
    setSelectedFile(null);
    setErrorMsg(null);
  };

  return (
    <div className="card" id={isEditing ? "edit-submission" : "new-submission"}>
      <div className="card-header">
        <h2 className="card-title">{isEditing ? "Edit Pending Submission" : "Submit New Artwork"}</h2>
        <span className="artwork-status status-review" style={{ fontSize: "8px" }}>
          {isEditing ? "Pending submission" : "Curators review weekly"}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card-body">
        {errorMsg ? (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded font-dm-mono">
            {errorMsg}
          </div>
        ) : null}
        {exhibitionError && !isEditing ? (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded font-dm-mono">
            {exhibitionError}
          </div>
        ) : null}

        {!isEditing ? (
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
                {errors.exhibitionId ? (
                  <p className="text-red-500 text-xs mt-1 font-dm-mono">
                    {errors.exhibitionId.message}
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <div className="form-group">
            <input type="hidden" {...register("exhibitionId")} />
            <label className="form-label">Review destination</label>
            <div className="form-input" style={{ display: "flex", alignItems: "center" }}>
              This submission stays attached to its current exhibition review.
            </div>
          </div>
        )}

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
                <p className="upload-text">
                  {isEditing
                    ? "Upload a new image only if you want to replace the current one"
                    : "Drop artwork image here or click to browse"}
                </p>
                <p className="upload-sub">
                  JPEG, PNG or TIFF — max 20MB — min 2000px on longest edge
                </p>
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
            <input {...register("dimensions")} className="form-input" type="text" placeholder="H × W cm" />
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
          {isEditing ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            {isEditing ? "Reset changes" : "Clear"}
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting || (!isEditing && (loadingExhibitions || exhibitions.length === 0))}
          >
            {isSubmitting ? (isEditing ? "Saving..." : "Submitting...") : isEditing ? "Save changes" : "Submit for review"}
          </button>
        </div>
      </form>
    </div>
  );
}
