import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";
import type { Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { getPublicCollection } from "@/lib/publicApi";

export default async function ArchivePage() {
  const archiveExhibitions = await getPublicCollection<Exhibition>("/Exhibitions/archive", {
    revalidate: 600,
    tags: ["public-archive"],
  });

  const archiveItems = archiveExhibitions.map((exhibition) => {
    const year = exhibition.endDate
      ? new Date(exhibition.endDate).getFullYear().toString()
      : exhibition.startDate
        ? new Date(exhibition.startDate).getFullYear().toString()
        : "";

    return {
      slug: exhibition.slug,
      year: year || "Archive",
      title: exhibition.title,
      artist: "Studio 201",
      image: exhibition.coverImageUrl || null,
    };
  });

  return (
    <div className="pt-32 pb-32 min-h-screen">
      <div className="px-6 md:px-12 mb-20">
        <Reveal>
          <SectionLabel>Archive</SectionLabel>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-20 items-end">
          <Reveal>
            <h1 className="font-display text-[clamp(40px,6vw,72px)] font-normal leading-[1.1] tracking-[-0.02em]">
              Selected
              <br />
              Archive
            </h1>
          </Reveal>
          <Reveal delay={2}>
            <p className="font-sub italic text-lg text-[var(--color-warm-slate)] leading-[1.6] justify-self-end">
              A record of exhibitions held at Studio 201 since its founding.
              Every show is remembered.
            </p>
          </Reveal>
        </div>
      </div>

      {archiveItems.length === 0 ? (
        <div className="px-6 md:px-12 pb-24 text-center text-gray-500 font-dm-mono text-sm tracking-widest uppercase">
          No Archive Exhibitions Found
        </div>
      ) : (
        <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px]">
          {archiveItems.map((item, i) => (
            <Reveal
              key={item.slug}
              delay={((i % 3) + 1) as 1 | 2 | 3}
              className="group cursor-pointer bg-[var(--color-bone)] border border-[var(--color-rule)] hover:border-[var(--color-sienna)] transition-colors duration-400 overflow-hidden"
            >
              <div className="aspect-[3/2] overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover filter brightness-85 saturate-60 transition-all duration-500 ease-out group-hover:brightness-100 group-hover:saturate-100"
                  />
                ) : (
                  <StudioImagePlaceholder
                    className="w-full h-full"
                    markClassName="w-20 md:w-24"
                    label="Archive"
                  />
                )}
              </div>
              <div className="p-7">
                <div className="font-mono text-[10px] text-[var(--color-dust)] tracking-[0.1em] mb-2">
                  {item.year}
                </div>
                <div className="font-display text-xl text-[var(--color-warm-slate)] mb-1.5 leading-[1.2]">
                  {item.title}
                </div>
                <div className="font-body text-[13px] text-[var(--color-dust)]">
                  {item.artist}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
