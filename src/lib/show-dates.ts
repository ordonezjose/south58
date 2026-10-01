// A show's time is a wall clock at the venue, not an instant: Bandsintown
// reports "2026-09-18T21:00:00" with no offset, meaning 9pm wherever the venue
// is. Those parts are pinned to UTC when parsed (see lib/bandsintown.ts), so
// every formatter has to read them back in UTC — formatting in the server's
// own zone would shift the time, and a late show would slide to the day before.
export const showDateFormatter = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" });
