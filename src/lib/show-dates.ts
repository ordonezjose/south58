// Keystatic stores a show's date as a plain calendar day ("2026-09-17"), and
// JavaScript parses a date-only string as midnight UTC. Reading that back in
// the server's own zone lands on the day before for anywhere behind UTC — the
// site renders in America/New_York, so every date showed up a day early. So
// show dates are only ever formatted and compared in UTC.

export const showDateFormatter = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" });

// Today's calendar day at midnight UTC, lined up with how show dates are
// stored so that a show happening today still counts as upcoming.
export const startOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};
