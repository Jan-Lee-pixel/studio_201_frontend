export function formatEventDate(dateStr?: string) {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatEventDay(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
}

export function formatEventMonthLabel(dateStr?: string) {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatEventDateRange(start?: string, end?: string) {
  if (!start && !end) return "Date TBA";
  if (start && !end) {
    return new Date(start).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  const startStr = start ? new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
  const endStr = end
    ? new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  return `${startStr} - ${endStr}`.trim();
}

export function getEventEffectiveDate(start?: string, end?: string) {
  if (end) return new Date(end);
  if (start) return new Date(start);
  return null;
}
