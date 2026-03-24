import clsx from "clsx";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";

interface ExhibitionCoverFrameProps {
  image?: string | null;
  alt: string;
  className?: string;
  mediaClassName?: string;
  imageClassName?: string;
  paddingClassName?: string;
  placeholderLabel?: string;
}

export function ExhibitionCoverFrame({
  image,
  alt,
  className,
  mediaClassName,
  imageClassName,
  paddingClassName,
  placeholderLabel = "Exhibition",
}: ExhibitionCoverFrameProps) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-[linear-gradient(160deg,#f1ebe1_0%,#eadfce_34%,#d5cdc0_100%)]",
        className,
      )}
    >
      {image ? (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className={clsx(
              "absolute inset-0 h-full w-full scale-110 object-cover opacity-24 blur-2xl saturate-75",
              mediaClassName,
            )}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(29,24,19,0.08))]" />
          <div className={clsx("relative flex h-full w-full items-center justify-center p-5 md:p-6", paddingClassName)}>
            <img
              src={image}
              alt={alt}
              className={clsx(
                "block max-h-full max-w-full object-contain shadow-[0_20px_50px_rgba(33,28,24,0.12)]",
                imageClassName,
              )}
            />
          </div>
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center p-8">
          <StudioImagePlaceholder className="h-full w-full" markClassName="w-16 md:w-20" label={placeholderLabel} />
        </div>
      )}
    </div>
  );
}
