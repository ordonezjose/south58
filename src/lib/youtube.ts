// Returns the video id for any of the shapes a YouTube link comes in, or null
// when the URL points somewhere else — callers treat that as a direct link to
// a playable video file.
// The id is interpolated into an iframe src, so anything that isn't the
// character set YouTube actually uses is rejected rather than embedded.
const ID_PATTERN = /^[A-Za-z0-9_-]{6,32}$/;

export function youTubeId(url: string): string | null {
  const id = parse(url);
  return id && ID_PATTERN.test(id) ? id : null;
}

function parse(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("youtu.be")) return u.pathname.slice(1) || null;
    if (!u.hostname.endsWith("youtube.com") && !u.hostname.endsWith("youtube-nocookie.com")) return null;
    if (u.pathname === "/watch") return u.searchParams.get("v");
    const [, segment, id] = u.pathname.split("/");
    return segment === "embed" || segment === "shorts" || segment === "v" ? id ?? null : null;
  } catch {
    return null;
  }
}
