// Picking an image in the Keystatic panel blocks the main thread while the
// file is read and its preview is built (~2s for a 600KB photo, longer for a
// camera-sized one) and Keystatic paints nothing meanwhile, so the panel looks
// like it has crashed. This draws the missing busy state.
//
// The spinner animates `transform` only, so the compositor keeps it moving
// even while the main thread is stuck — a JS-driven animation would freeze
// alongside everything else and defeat the purpose.

const STALL_MS = 120; // a frame gap this long means the thread was blocked
const CALM_MS = 400; // uninterrupted smooth frames before we call it done
const MIN_VISIBLE_MS = 250;

const style = document.createElement("style");
style.textContent = `
  .ks-busy {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 17, 21, 0.32);
    pointer-events: none;
  }
  /* Without this the class's own display would outrank the UA rule for
     [hidden] and the overlay would never actually go away. */
  .ks-busy[hidden] {
    display: none;
  }
  .ks-busy-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 24px;
    border-radius: 8px;
    background: #fff;
    color: #15171c;
    font: 500 14px/1.4 system-ui, sans-serif;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  }
  .ks-busy-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #d5d8df;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: ks-busy-spin 0.7s linear infinite;
  }
  @keyframes ks-busy-spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.append(style);

const overlay = document.createElement("div");
overlay.className = "ks-busy";
overlay.hidden = true;
const label = document.createElement("span");
const card = document.createElement("div");
card.className = "ks-busy-card";
const spinner = document.createElement("div");
spinner.className = "ks-busy-spinner";
card.append(spinner, label);
overlay.append(card);
document.body.append(overlay);

let shownAt = 0;

function show(message) {
  label.textContent = message;
  if (!overlay.hidden) return;
  overlay.hidden = false;
  shownAt = performance.now();
}

function hide() {
  overlay.hidden = true;
}

// Watches frame pacing and only clears once the thread has been smooth for a
// stretch — the file work happens in a later task than the change event, so
// the overlay gets a paint in before everything seizes up.
function hideWhenResponsive() {
  let previous = performance.now();
  let calmSince = previous;

  const tick = (now) => {
    if (now - previous > STALL_MS) calmSince = now;
    previous = now;

    if (now - calmSince > CALM_MS && now - shownAt > MIN_VISIBLE_MS) {
      hide();
      return;
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

document.addEventListener(
  "change",
  (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.type === "file" && target.files?.length) {
      show("Processing file…");
      hideWhenResponsive();
    }
  },
  true
);

// Saving writes the file and the JSON through the local API; that part is a
// plain request, so its duration is known exactly.
const nativeFetch = window.fetch;
let inFlight = 0;

window.fetch = async (...args) => {
  const [input, init] = args;
  const url = String(typeof input === "string" ? input : (input?.url ?? ""));
  // `||` rather than `??`: an absent method reads as "", which must still
  // fall through to GET or every read would look like a write.
  const method = String(init?.method || input?.method || "GET").toUpperCase();
  const isWrite = url.includes("/api/keystatic") && method !== "GET";

  if (!isWrite) return nativeFetch(...args);

  inFlight += 1;
  show("Saving changes…");
  try {
    return await nativeFetch(...args);
  } finally {
    inFlight -= 1;
    if (inFlight === 0) hide();
  }
};
