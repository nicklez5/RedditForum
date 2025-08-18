// utils/dates.ts
export function formatWhen(input: string | number | Date, locale = "en-US") {
  const d = new Date(input);
  if (isNaN(d.getTime())) return ""; // or "Invalid date"

  const now = new Date();

  // start-of-day helpers (local time)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfLast7 = new Date(startOfToday);
  startOfLast7.setDate(startOfLast7.getDate() - 6);

  const time = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(d);

  if (d >= startOfToday) return `Today at ${time}`;
  if (d >= startOfYesterday) return `Yesterday at ${time}`;
  if (d >= startOfLast7) {
    const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d);
    return `${weekday} at ${time}`;
  }
  const date = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(d);
  return `${date} at ${time}`;
}
