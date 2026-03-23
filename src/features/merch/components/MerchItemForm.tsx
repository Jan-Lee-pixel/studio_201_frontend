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
type ImageSlotKey = "primary" | "secondary" | "tertiary";
type ImageSlotState = {
  file: File | null;
  previewUrl: string | null;
  mediaId: string | null;
  cleared: boolean;
};

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

const IMAGE_SLOTS: Array<{
  key: ImageSlotKey;
  label: string;
  description: string;
  optional: boolean;
}> = [
  {
    key: "primary",
    label: "Main image",
    description: "Used in the catalog and shown first on the item page.",
    optional: false,
  },
  {
    key: "secondary",
    label: "Detail image 2",
    description: "Optional supporting image for alternate angle or close detail.",
    optional: true,
  },
  {
    key: "tertiary",
    label: "Detail image 3",
    description: "Optional third image for the merch gallery.",
    optional: true,
  },
];

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

function getInitialImageSlots(item: MerchItem | null | undefined): Record<ImageSlotKey, ImageSlotState> {
  return {
    primary: {
      file: null,
      previewUrl: item?.primaryImageUrl || null,
      mediaId: item?.primaryMediaId || null,
      cleared: false,
    },
    secondary: {
      file: null,
      previewUrl: item?.secondaryImageUrl || null,
      mediaId: item?.secondaryMediaId || null,
      cleared: false,
    },
    tertiary: {
      file: null,
      previewUrl: item?.tertiaryImageUrl || null,
      mediaId: item?.tertiaryMediaId || null,
      cleared: false,
    },
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
  const [imageSlots, setImageSlots] = useState<Record<ImageSlotKey, ImageSlotState>>(getInitialImageSlots(item));
  const fileInputRefs = useRef<Record<ImageSlotKey, HTMLInputElement | null>>({
    primary: null,
    secondary: null,
    tertiary: null,
  });
  const objectUrlRefs = useRef<Record<ImageSlotKey, string | null>>({
    primary: null,
    secondary: null,
    tertiary: null,
  });
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

  const revokeObjectUrl = (slot: ImageSlotKey) => {
    const existing = objectUrlRefs.current[slot];
    if (existing) {
      URL.revokeObjectURL(existing);
      objectUrlRefs.current[slot] = null;
    }
  };

  const resetImages = (nextItem: MerchItem | null | undefined) => {
    (Object.keys(objectUrlRefs.current) as ImageSlotKey[]).forEach(revokeObjectUrl);
    setImageSlots(getInitialImageSlots(nextItem));
  };

  useEffect(() => {
    reset(getDefaultValues(item, mode));
    resetImages(item);
    setErrorMsg(null);
  }, [item, mode, reset]);

  useEffect(() => {
    return () => {
      (Object.keys(objectUrlRefs.current) as ImageSlotKey[]).forEach(revokeObjectUrl);
    };
  }, []);

  const setSlotFile = (slot: ImageSlotKey, file: File) => {
    revokeObjectUrl(slot);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRefs.current[slot] = objectUrl;

    setImageSlots((current) => ({
      ...current,
      [slot]: {
        ...current[slot],
        file,
        previewUrl: objectUrl,
        cleared: false,
      },
    }));
  };

  const clearSlot = (slot: ImageSlotKey) => {
    revokeObjectUrl(slot);
    setImageSlots((current) => ({
      ...current,
      [slot]: {
        file: null,
        previewUrl: null,
        mediaId: null,
        cleared: true,
      },
    }));
  };

  const uploadSlotMedia = async (slot: ImageSlotKey, file: File, title: string) => {
    const fileSizeMb = file.size / (1024 * 1024);
    if (fileSizeMb > MAX_FILE_SIZE_MB) {
      throw new Error(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
    }

    const extensionFromName = file.name.split(".").pop();
    const extensionFromType = file.type?.split("/").pop();
    const extension = extensionFromName || extensionFromType || "jpg";
    const uuid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const subfolder = mode === "artist" ? "backroom" : "catalog";
    const filePath = `merch/${subfolder}/${authUserId}/${uuid}.${extension}`;
    const uploadResult = await supabase.storage.from(MERCH_BUCKET).upload(filePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (uploadResult.error) {
      throw new Error("Failed to upload merch image. Please try again.");
    }

    const { data: publicData } = supabase.storage.from(MERCH_BUCKET).getPublicUrl(filePath);

    try {
      const mediaAsset = await mediaAssetService.createAsset(
        {
          fileName: file.name,
          filePath,
          publicUrl: publicData.publicUrl,
          mediaType: file.type || "image/jpeg",
          altText: `${title} (${slot} image)`,
        },
        token,
      );
      return mediaAsset.id;
    } catch (error) {
      await supabase.storage.from(MERCH_BUCKET).remove([filePath]);
      throw error;
    }
  };

  const onSubmit = async (data: MerchFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const hasSortOrder = Boolean(data.sortOrder?.trim());
      const parsedSortOrder = hasSortOrder ? Number.parseInt(data.sortOrder!.trim(), 10) : null;

      if (hasSortOrder && (!Number.isFinite(parsedSortOrder as number) || (parsedSortOrder as number) < 0)) {
        setErrorMsg("Sort order must be a whole number starting from 0.");
        setIsSubmitting(false);
        return;
      }

      const slotMediaIds: Record<ImageSlotKey, string | null> = {
        primary: imageSlots.primary.mediaId,
        secondary: imageSlots.secondary.mediaId,
        tertiary: imageSlots.tertiary.mediaId,
      };

      for (const slot of IMAGE_SLOTS) {
        const slotState = imageSlots[slot.key];
        if (slotState.file) {
          slotMediaIds[slot.key] = await uploadSlotMedia(slot.key, slotState.file, data.title);
        } else if (slot.optional && slotState.cleared) {
          slotMediaIds[slot.key] = null;
        }
      }

      if (!slotMediaIds.primary) {
        setErrorMsg("Please choose a main image.");
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
        primaryMediaId: slotMediaIds.primary,
        ...(isEditing || slotMediaIds.secondary !== null || imageSlots.secondary.cleared
          ? { secondaryMediaId: slotMediaIds.secondary }
          : {}),
        ...(isEditing || slotMediaIds.tertiary !== null || imageSlots.tertiary.cleared
          ? { tertiaryMediaId: slotMediaIds.tertiary }
          : {}),
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
      resetImages(item);
      onSuccess();
    } catch (error) {
      console.error("Failed to save merch item", error);
      setErrorMsg(error instanceof Error ? error.message : "Failed to save merch item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetLabel = isEditing ? "Reset" : "Clear";

  return (
    <div className="border border-[var(--color-rule)] bg-white p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Merch item</div>
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

        <div className="space-y-3 border border-dashed border-[var(--color-rule)] bg-[var(--color-bone)] px-5 py-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
            Merch gallery
          </div>
          <div className="text-sm leading-6 text-[var(--color-dust)]">
            Use one main image and up to two supporting images so the public item page can show a cleaner gallery and a full preview.
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {IMAGE_SLOTS.map((slot) => {
              const slotState = imageSlots[slot.key];
              const hasImage = Boolean(slotState.previewUrl);

              return (
                <div key={slot.key} className="rounded border border-[var(--color-rule)] bg-white p-4">
                  <input
                    ref={(element) => {
                      fileInputRefs.current[slot.key] = element;
                    }}
                    type="file"
                    accept="image/jpeg,image/png,image/tiff,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) setSlotFile(slot.key, file);
                      event.currentTarget.value = "";
                    }}
                  />

                  <div className="flex min-h-[220px] items-center justify-center rounded border border-[var(--color-rule)] bg-[var(--color-bone)] p-4">
                    {hasImage ? (
                      <img
                        src={slotState.previewUrl || undefined}
                        alt={`${slot.label} preview`}
                        className="max-h-[220px] w-auto max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                          {slot.optional ? "Optional image" : "Required image"}
                        </div>
                        <div className="mt-3 text-sm leading-6 text-[var(--color-dust)]">{slot.description}</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">{slot.label}</div>
                    <div className="mt-2 text-sm leading-6 text-[var(--color-near-black)]">
                      {slotState.file
                        ? slotState.file.name
                        : hasImage
                          ? "Current image is ready. Replace it if needed."
                          : slot.description}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => fileInputRefs.current[slot.key]?.click()}
                      >
                        {hasImage ? "Replace image" : "Upload image"}
                      </button>
                      {slot.optional && hasImage ? (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => clearSlot(slot.key)}>
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
              resetImages(item);
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
