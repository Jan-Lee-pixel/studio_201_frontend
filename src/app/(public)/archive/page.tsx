import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArchiveItem } from "@/features/exhibitions/components/ArchiveItem";

export default function ArchivePage() {
  const archiveItems = [
    { slug: "mga-paa-sa-alapaap", year: "2025 · EXH-2025-04", title: "Mga Paa sa Alapaap", artist: "Maria Santos", image: "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=800&q=80" },
    { slug: "halina-at-luha", year: "2024 · EXH-2024-12", title: "Halina at Luha", artist: "Maria Santos", image: "https://images.unsplash.com/photo-1590907047706-ee9c08cf3189?w=800&q=80" },
    { slug: "tahanan", year: "2024 · EXH-2024-08", title: "Tahanan", artist: "Group Exhibition", image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80" },
    { slug: "sa-pamamagitan-ng-kahoy", year: "2023 · EXH-2023-11", title: "Sa Pamamagitan ng Kahoy", artist: "Jun Manlangit", image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80" },
    { slug: "kulay-ng-araw", year: "2023 · EXH-2023-05", title: "Kulay ng Araw", artist: "Elena Yap", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80" },
    { slug: "pagbabalik", year: "2022 · EXH-2022-10", title: "Pagbabalik", artist: "Carlo Reyes", image: "https://images.unsplash.com/photo-1620510625142-b45cbb784397?w=800&q=80" },
    { slug: "anino", year: "2022 · EXH-2022-04", title: "Anino", artist: "Group Exhibition", image: "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80" },
    { slug: "kung-sino-ang-nandito", year: "2021 · EXH-2021-09", title: "Kung Sino Ang Nandito", artist: "Maria Santos", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80" },
    { slug: "simula", year: "2021 · EXH-2021-02", title: "Simula", artist: "Inaugural Exhibition", image: "https://images.unsplash.com/photo-1590907047706-ee9c08cf3189?w=800&q=80" },
  ];

  return (
    <div className="pt-32 pb-32 min-h-screen">
      <div className="px-6 md:px-12 mb-20">
        <Reveal><SectionLabel>Archive</SectionLabel></Reveal>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-20 items-end">
          <Reveal><h1 className="font-display text-[clamp(40px,6vw,72px)] font-normal leading-[1.1] tracking-[-0.02em]">Selected<br />Archive</h1></Reveal>
          <Reveal delay={2}><p className="font-sub italic text-lg text-[var(--color-warm-slate)] leading-[1.6] justify-self-end">A record of exhibitions held at Studio 201 since its founding. Every show is remembered.</p></Reveal>
        </div>
      </div>

      <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px]">
        {archiveItems.map((item, i) => (
          <Reveal key={item.slug} delay={(i % 3 + 1) as 1|2|3} className="group cursor-pointer bg-[var(--color-bone)] border border-[var(--color-rule)] hover:border-[var(--color-sienna)] transition-colors duration-400 overflow-hidden">
             <div className="aspect-[3/2] overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover filter brightness-85 saturate-60 transition-all duration-500 ease-out group-hover:brightness-100 group-hover:saturate-100" />
             </div>
             <div className="p-7">
                <div className="font-mono text-[10px] text-[var(--color-dust)] tracking-[0.1em] mb-2">{item.year}</div>
                <div className="font-display text-xl text-[var(--color-warm-slate)] mb-1.5 leading-[1.2]">{item.title}</div>
                <div className="font-body text-[13px] text-[var(--color-dust)]">{item.artist}</div>
             </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
