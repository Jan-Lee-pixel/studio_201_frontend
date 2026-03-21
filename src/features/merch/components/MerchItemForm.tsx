"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { mediaAssetService } from "@/features/mediaAssets/services/mediaAssetService";
import {
  merchService,
  MerchChannel,
  MerchItem,
  MerchStatus,
  MerchVisibility,
  MERCH_CHANNEL_OPTIONS,
  MERCH_ITEM_TYPE_OPTIONS,
  MERCH_STATUS_OPTIONS,
  MERCH_VISIBILITY_OPTIONS,
} from "@/features/merch/services/merchService";

const MERCH_BUCKET = "studio201-public";
const MAX_FILE_SIZE_MB = 20;

const merchSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  shortNote: z.string().optional(),
  itemType: z.string().min(1, "Select an item type"),
  visibility: z.string().optional(),
  priceLabel: z.string().optional(),
  inquiryEmail: z
    .string()
    .optional()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email"),
  channel: z.string().optional(),
  status: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.string().optional(),
  artistId: z.string().optional(),
});

type MerchFormData = z.infer<typeof merchSchema>;

type ArtistOption = {
  id: string;
  fullName: string;
};

interface MerchItemFormProps {
  token: string;
  authUserId: string;
  mode: "artist" | "admin";
  item?: MerchItem | null;
  artistOptions?: ArtistOption[];
  submitLabel?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

function getDefaultValues(item: MerchItem | null | undefined, mode: "artist" | "admin"): MerchFormData {
  return {
    title: item?.title || "",
    description: item?.description || "",
    shortNote: item?.shortNote || "",
    itemType: item?.itemType || "",
    visibility: item?.visibility || "public",
    priceLabel: item?.priceLabel || "",
    inquiryEmail: item?.inquiryEmail || "",
    channel: item?.channel || "merch",
    status: item?.status || (mode === "artist" ? "draft" : "published"),
    isFeatured: item?.isFeatured ?? false,
    sortOrder: item?.sortOrder != null ? String(item.sortOrder) : "",
    artistId: item?.artistId || "",
  };
}

export function MerchItemForm({
  token,
  authUserId,
  mode,
  item = null,
  artistOptions = [],
  submitLabel,
  onSuccess,
  onCancel,
}: MerchItemFormProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(item?.primaryImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(item);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<MerchFormData>({
    resolver: zodResolver(merchSchema),
    defaultValues: getDefaultValues(item, mode),
  });

  const visibilityValue = watch("visibility");
  const channelValue = watch("channel");
  const statusValue = watch("status");

  useEffect(() => {
    reset(getDefaultValues(item, mode));
    setSelectedFile(null);
    setPreviewUrl(item?.primaryImageUrl || null);
    setErrorMsg(null);
  }, [item, mode, reset]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(item?.primaryImageUrl || null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [item?.primaryImageUrl, selectedFile]);

  const onSubmit = async (data: MerchFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let primaryMediaId = item?.primaryMediaId ?? undefined;
      let uploadedFilePath: string | null = null;
      const hasSortOrder = Boolean(data.sortOrder?.trim());
      const parsedSortOrder = hasSortOrder ? Number.parseInt(data.sortOrder!.trim(), 10) : null;

      if (hasSortOrder && (!Number.isFinite(parsedSortOrder as number) || (parsedSortOrder as number) < 0)) {
        setErrorMsg("Sort order must be a whole number starting from 0.");
        setIsSubmitting(false);
        return;
      }

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

        const subfolder = mode === "artist" ? "backroom" : "catalog";
        const filePath = `merch/${subfolder}/${authUserId}/${uuid}.${extension}`;
        const uploadResult = await supabase.storage.from(MERCH_BUCKET).upload(filePath, selectedFile, {
          contentType: selectedFile.type || "image/jpeg",
          upsert: false,
        });

        if (uploadResult.error) {
          console.error("Merch upload failed:", uploadResult.error);
          setErrorMsg("Failed to upload merch image. Please try again.");
          setIsSubmitting(false);
          return;
        }

        uploadedFilePath = filePath;
        const { data: publicData } = supabase.storage.from(MERCH_BUCKET).getPublicUrl(filePath);
        const mediaAsset = await mediaAssetService
          .createAsset(
            {
              fileName: selectedFile.name,
              filePath,
              publicUrl: publicData.publicUrl,
              mediaType: selectedFile.type || "image/jpeg",
              altText: data.title,
            },
            token,
          )
          .catch(async (error) => {
            if (uploadedFilePath) {
              await supabase.storage.from(MERCH_BUCKET).remove([uploadedFilePath]);
            }
            throw error;
          });

        primaryMediaId = mediaAsset.id;
      } else if (!isEditing) {
        setErrorMsg("Please choose an image.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title: data.title,
        description: data.description || null,
        shortNote: data.shortNote || null,
        itemType: data.itemType as MerchItem["itemType"],
        visibility: (data.visibility || "public") as MerchVisibility,
        priceLabel: data.priceLabel || null,
        inquiryEmail: data.inquiryEmail || null,
        channel: (data.channel || "merch") as MerchChannel,
        ...(primaryMediaId ? { primaryMediaId } : {}),
        ...(mode === "admin"
          ? {
              status: (data.status || "published") as MerchStatus,
              isFeatured: data.isFeatured ?? false,
              sortOrder: parsedSortOrder,
              artistId: data.artistId || null,
            }
          : {}),
      };

      if (isEditing && item?.id) {
        await merchService.updateMerchItem(item.id, payload, token);
      } else {
        await merchService.createMerchItem(payload, token);
      }

      reset(getDefaultValues(item, mode));
      setSelectedFile(null);
      onSuccess();
    } catch (error) {
      console.error("Failed to save merch item", error);
      setErrorMsg("Failed to save merch item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetLabel = isEditing ? "Reset" : "Clear";

  return (
    <div className="border border-[var(--color-rule)] bg-white p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
            {mode === "artist" ? "Merch item" : "Merch item"}
          </div>
          <h3 className="mt-2 font-display text-2xl text-[var(--color-near-black)]">
            {isEditing ? "Edit item" : mode === "artist" ? "Add merch or backroom item" : "Add merch item"}
          </h3>
        </div>
        {onCancel ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errorMsg ? (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</div>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/tiff,image/webp"
          style={{ display: "none" }}
          onChange={(event) => {
            if (event.target.files?.length) {
              setSelectedFile(event.target.files[0]);
            }
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border border-dashed border-[var(--color-rule)] bg-[var(--color-bone)] px-6 py-8 text-left transition-colors hover:border-[var(--color-near-black)]"
        >
          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-[240px_minmax(0,1fr)] md:items-center">
            <div className="flex min-h-[220px] items-center justify-center rounded border border-[var(--color-rule)] bg-white p-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected merch preview"
                  className="max-h-[260px] w-auto max-w-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                    No image yet
                  </div>
                  <div className="mt-3 text-sm leading-6 text-[var(--color-dust)]">
                    Choose the main image for this merch item.
                  </div>
                </div>
              )}
            </div>

            <div className="rounded border border-[var(--color-rule)] bg-white px-5 py-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                {selectedFile ? "Selected image" : previewUrl ? "Current image" : "Upload image"}
              </div>
              <div className="mt-3 text-sm leading-6 text-[var(--color-near-black)]">
                {selectedFile
                  ? selectedFile.name
                  : previewUrl
                    ? "Click here if you want to replace the current merch image."
                    : "Click here to upload the main image for this item."}
              </div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                JPG, PNG, TIFF, or WEBP up to {MAX_FILE_SIZE_MB}MB
              </div>
            </div>
          </div>
        </button>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Title
            </span>
            <input
              {...register("title")}
              className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm"
              placeholder="Item title"
            />
            {errors.title ? <span className="mt-1 block text-xs text-red-600">{errors.title.message}</span> : null}
          </label>

          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Item type
            </span>
            <select {...register("itemType")} className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm">
              <option value="">Select a type</option>
              {MERCH_ITEM_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.itemType ? <span className="mt-1 block text-xs text-red-600">{errors.itemType.message}</span> : null}
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Short note
            </span>
            <input
              {...register("shortNote")}
              className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm"
              placeholder="A short line for the card or marquee"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Description
            </span>
            <textarea
              {...register("description")}
              rows={5}
              className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm"
              placeholder="Write a short editorial description for the item."
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Price label
            </span>
            <input
              {...register("priceLabel")}
              className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm"
              placeholder="PHP 1,800 or Inquiry only"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Inquiry email
            </span>
            <input
              {...register("inquiryEmail")}
              className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm"
              placeholder="studio@example.com"
            />
            {errors.inquiryEmail ? (
              <span className="mt-1 block text-xs text-red-600">{errors.inquiryEmail.message}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Visibility
            </span>
            <select
              {...register("visibility")}
              defaultValue={visibilityValue || "public"}
              className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm"
            >
              {MERCH_VISIBILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              {mode === "artist" ? "Request placement" : "Channel"}
            </span>
            <select
              {...register("channel")}
              defaultValue={channelValue || "merch"}
              className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm"
            >
              {MERCH_CHANNEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {mode === "artist" ? (
              <span className="mt-1 block text-xs text-[var(--color-dust)]">
                Studio 201 will still review and can change the final public placement before release.
              </span>
            ) : null}
          </label>

          {mode === "admin" ? (
            <>
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                  Status
                </span>
                <select
                  {...register("status")}
                  defaultValue={statusValue || "published"}
                  className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm"
                >
                  {MERCH_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                  Sort order
                </span>
                <input
                  {...register("sortOrder")}
                  className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm"
                  inputMode="numeric"
                  placeholder="Auto"
                />
              </label>

              <label className="flex items-center gap-3 rounded border border-[var(--color-rule)] bg-[var(--color-bone)] px-4 py-3">
                <input type="checkbox" {...register("isFeatured")} />
                <span className="text-sm text-[var(--color-near-black)]">Feature this item on the merch page</span>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                  Artist
                </span>
                <select {...register("artistId")} className="w-full rounded border border-[var(--color-rule)] bg-white px-3 py-3 text-sm">
                  <option value="">No linked artist</option>
                  {artistOptions.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.fullName}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              reset(getDefaultValues(item, mode));
              setSelectedFile(null);
              setErrorMsg(null);
            }}
          >
            {resetLabel}
          </button>
          <button type="submit" className="btn btn-terracotta btn-sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel || (isEditing ? "Save item" : "Create item")}
          </button>
        </div>
      </form>
    </div>
  );
}
