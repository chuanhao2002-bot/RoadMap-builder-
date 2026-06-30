import type { Project } from "@/types/project";

export const DAY_WIDTH = 6;
export const ROW_HEIGHT = 44;
export const LEFT_PADDING = 16;
export const TOP_PADDING = 40;

export function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export interface TimelineRow {
  project: Project;
  x: number;
  y: number;
  width: number;
}

export interface TimelineLayout {
  rows: TimelineRow[];
  totalWidth: number;
  totalHeight: number;
  months: { x: number; label: string }[];
}

export function computeTimelineLayout(projects: Project[], topPadding = TOP_PADDING): TimelineLayout {
  if (projects.length === 0) {
    return { rows: [], totalWidth: 0, totalHeight: 0, months: [] };
  }
  const starts = projects.map((p) => new Date(p.startDate));
  const ends = projects.map((p) => new Date(p.endDate));
  const minDate = new Date(Math.min(...starts.map((d) => d.getTime())));
  minDate.setDate(1);
  const maxDate = new Date(Math.max(...ends.map((d) => d.getTime())));

  const rows = projects.map((p, i) => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    const x = LEFT_PADDING + daysBetween(minDate, start) * DAY_WIDTH;
    const width = Math.max(daysBetween(start, end) * DAY_WIDTH, 24);
    const y = topPadding + i * ROW_HEIGHT;
    return { project: p, x, y, width };
  });

  const totalDays = daysBetween(minDate, maxDate) + 30;
  const totalWidth = LEFT_PADDING * 2 + totalDays * DAY_WIDTH;
  const totalHeight = topPadding + projects.length * ROW_HEIGHT + 20;

  const months: { x: number; label: string }[] = [];
  const cursor = new Date(minDate);
  while (cursor <= maxDate) {
    months.push({
      x: LEFT_PADDING + daysBetween(minDate, cursor) * DAY_WIDTH,
      label: cursor.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return { rows, totalWidth, totalHeight, months };
}

export interface YearBar {
  project: Project;
  leftPct: number;
  widthPct: number;
}

export interface YearMonth {
  leftPct: number;
  label: string;
}

export interface YearLayout {
  bars: YearBar[];
  months: YearMonth[];
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function computeYearLayout(projects: Project[], year: number): YearLayout {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const totalDays = isLeapYear(year) ? 366 : 365;

  const bars: YearBar[] = projects
    .map((project) => {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const clippedStart = start < yearStart ? yearStart : start;
      const clippedEnd = end > yearEnd ? yearEnd : end;
      if (clippedStart > clippedEnd) return null;

      const leftPct = (daysBetween(yearStart, clippedStart) / totalDays) * 100;
      const widthDays = Math.max(daysBetween(clippedStart, clippedEnd), 1);
      const widthPct = (widthDays / totalDays) * 100;
      return { project, leftPct, widthPct };
    })
    .filter((b): b is YearBar => b !== null);

  const months: YearMonth[] = [];
  for (let m = 0; m < 12; m++) {
    const monthStart = new Date(year, m, 1);
    months.push({
      leftPct: (daysBetween(yearStart, monthStart) / totalDays) * 100,
      label: monthStart.toLocaleDateString("en-US", { month: "short" }),
    });
  }

  return { bars, months };
}

export function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}
