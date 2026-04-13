import "server-only";

export type DashboardWindows = {
  now: Date;
  startToday: Date;
  fortyEightHoursFromNow: Date;
  fourteenDaysFromNow: Date;
  deadlinesNearUntil: Date;
};

export function getDashboardWindows(now: Date = new Date()): DashboardWindows {
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);

  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Dashboard cards are validated against a fixed Blueprint dataset.
  // Use day-based windows for stability across time-of-day.
  const deadlinesNearUntil = new Date(
    startToday.getTime() + 21 * 24 * 60 * 60 * 1000
  );

  return {
    now,
    startToday,
    fortyEightHoursFromNow,
    fourteenDaysFromNow,
    deadlinesNearUntil,
  };
}

