// Tour dates come from Bandsintown, which is where the band already manages
// them. The API key is scoped to one artist and must stay server-side, so this
// module only ever runs on the server — never import it into a client script.
//
// Artist is addressed by id rather than name: the name is editable in the
// Bandsintown dashboard and would silently break the feed if it changed.
const ARTIST = "id_15393148"; // SOUTH58
const ENDPOINT = "https://rest.bandsintown.com";
const TTL_MS = 15 * 60 * 1000;

export interface Show {
  id: string;
  /** Wall-clock start, carried as UTC so it formats back exactly as entered. */
  date: Date;
  venue: string;
  city: string;
  /** Direct ticket link when the event has one. */
  ticketUrl?: string;
  /** The event on Bandsintown — the RSVP/track destination their terms require. */
  eventUrl: string;
}

export type ShowsResult =
  | { ok: true; upcoming: Show[]; past: Show[] }
  | { ok: false; reason: "unconfigured" | "unavailable" };

interface RawEvent {
  id: string;
  url: string;
  datetime: string;
  title?: string;
  offers?: { type?: string; status?: string; url?: string }[];
  venue?: { name?: string; city?: string; region?: string; country?: string };
}

let cache: { at: number; value: ShowsResult } | null = null;

export async function getShows(): Promise<ShowsResult> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  const appId = readAppId();
  if (!appId) return { ok: false, reason: "unconfigured" };

  try {
    const [upcoming, past] = await Promise.all([
      fetchEvents(appId, "upcoming"),
      fetchEvents(appId, "past"),
    ]);
    const value: ShowsResult = {
      ok: true,
      upcoming: upcoming.sort((a, b) => a.date.getTime() - b.date.getTime()),
      past: past.sort((a, b) => b.date.getTime() - a.date.getTime()),
    };
    cache = { at: Date.now(), value };
    return value;
  } catch (error) {
    console.error("[bandsintown] could not load events:", error);
    // Serve the last good response rather than an empty page if we have one.
    if (cache) return cache.value;
    return { ok: false, reason: "unavailable" };
  }
}

// Vite inlines `import.meta.env` at build time, so on its own the key would be
// frozen into the bundle and rotating it would mean a redeploy. The live
// environment is read first so a new key takes effect on the next request, and
// the inlined value stays as the fallback that `astro dev` relies on.
function readAppId(): string | undefined {
  const runtime = typeof process !== "undefined" ? process.env?.BANDSINTOWN_APP_ID : undefined;
  return runtime || import.meta.env.BANDSINTOWN_APP_ID || undefined;
}

async function fetchEvents(appId: string, date: "upcoming" | "past"): Promise<Show[]> {
  const url = `${ENDPOINT}/artists/${ARTIST}/events?app_id=${encodeURIComponent(appId)}&date=${date}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new Error(`${date}: HTTP ${response.status}`);

  const body: unknown = await response.json();
  if (!Array.isArray(body)) throw new Error(`${date}: expected an array`);

  return body.map(normalize).filter((show): show is Show => show !== null);
}

function normalize(raw: RawEvent): Show | null {
  const date = parseWallClock(raw.datetime);
  if (!date || !raw.id || !raw.url) return null;

  // Bandsintown puts the event title in venue.name once a title is set, so the
  // title is preferred for the heading and the venue only fills in otherwise.
  const venue = raw.title?.trim() || raw.venue?.name?.trim() || "TBA";

  const place = [raw.venue?.city, raw.venue?.region || raw.venue?.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  const ticket = raw.offers?.find((offer) => offer.url && offer.status !== "sold out")?.url;

  return {
    id: raw.id,
    date,
    venue,
    city: place,
    ticketUrl: ticket,
    eventUrl: raw.url,
  };
}

// `datetime` is the venue's local time with no offset ("2026-09-18T21:00:00").
// Parsing it directly would make the server's own zone shift it, so the parts
// are read literally and pinned to UTC; every formatter here renders in UTC,
// which plays the same wall-clock back.
function parseWallClock(value: string | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value ?? "");
  if (!match) return null;
  const [, y, m, d, hh, mm] = match.map(Number) as unknown as number[];
  return new Date(Date.UTC(y, m - 1, d, hh, mm));
}
