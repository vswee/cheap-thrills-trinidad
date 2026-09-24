const TIME_ZONE = "America/Port_of_Spain";

type HolidayRule = {
  name: string;
  month?: number;
  day?: number;
  easterOffset?: number;
  dates?: Record<number, string>;
};

// Dates for lunar observances and official substitutions belong in `dates`,
// keyed by year, after they are announced by Trinidad and Tobago.
const HOLIDAYS: HolidayRule[] = [
  { name: "New Year's Day", month: 1, day: 1 },
  { name: "Spiritual Baptist Liberation Day", month: 3, day: 30 },
  { name: "Indian Arrival Day", month: 5, day: 30 },
  { name: "Labour Day", month: 6, day: 19 },
  { name: "Emancipation Day", month: 8, day: 1 },
  { name: "Independence Day", month: 8, day: 31 },
  { name: "Republic Day", month: 9, day: 24 },
  { name: "Christmas Day", month: 12, day: 25 },
  { name: "Boxing Day", month: 12, day: 26, dates: { 2026: "2026-12-28" } },
  { name: "Good Friday", easterOffset: -2 },
  { name: "Easter Monday", easterOffset: 1 },
  { name: "Corpus Christi", easterOffset: 60 },
  { name: "Carnival Monday", easterOffset: -48 },
  { name: "Carnival Tuesday", easterOffset: -47 },
  { name: "Eid-ul-Fitr", dates: { 2026: "2026-03-20" } },
];

function dateInTrinidad(date: Date): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function easterSunday(year: number): string {
  // Gregorian computus (Meeus/Jones/Butcher), represented as a UTC calendar date.
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function holidayDate(rule: HolidayRule, year: number): string | null {
  const override = rule.dates?.[year];
  if (override) return override;
  if (rule.easterOffset !== undefined) return addDays(easterSunday(year), rule.easterOffset);
  if (rule.month !== undefined && rule.day !== undefined) {
    return `${year}-${String(rule.month).padStart(2, "0")}-${String(rule.day).padStart(2, "0")}`;
  }
  return null;
}

export function getTrinidadHoliday(date = new Date()): string | null {
  const today = dateInTrinidad(date);
  const year = Number(today.slice(0, 4));
  return HOLIDAYS.find((holiday) => holidayDate(holiday, year) === today)?.name ?? null;
}
