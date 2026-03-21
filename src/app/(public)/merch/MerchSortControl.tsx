"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface MerchSortControlProps {
  value: string;
}

const SORT_OPTIONS = [
  { value: "curated", label: "Curated" },
  { value: "newest", label: "Newest" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "type-asc", label: "Type A-Z" },
];

export function MerchSortControl({ value }: MerchSortControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
        Catalog order
      </span>
      <select
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          const nextValue = event.target.value;

          if (!nextValue || nextValue === "curated") {
            params.delete("sort");
          } else {
            params.set("sort", nextValue);
          }

          const query = params.toString();
          router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        }}
        className="border border-[var(--color-rule)] bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-near-black)] outline-none transition-colors duration-300 hover:border-[var(--color-near-black)]"
        aria-label="Sort merch listings"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
