// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import keystatic from "@keystatic/astro";

import vercel from "@astrojs/vercel";

import react from "@astrojs/react";

// Keystatic ("local" storage) has no auth of its own — it's meant for local
// editing only, per the brief. It injects /keystatic and /api/keystatic as
// non-prerendered (SSR) routes regardless of `output`, so it's only wired in
// for `astro dev`; a production build (Vercel) omits it, leaving every page
// fully static. @astrojs/react is required because Keystatic's admin UI is a
// React app mounted with `client:only="react"`; @astrojs/vercel is required
// only because those SSR routes need *an* adapter to run at all in dev/build.
const isDev = process.env.NODE_ENV !== "production";

// Keystatic's admin UI ships no busy state for picking a file, which reads as
// a hung panel. The script is pulled in only on the /keystatic routes, and the
// integration itself only exists in dev, so nothing reaches a production build.
/** @returns {import("astro").AstroIntegration} */
const keystaticUploadFeedback = () => ({
  name: "keystatic-upload-feedback",
  hooks: {
    "astro:config:setup": ({ injectScript }) => {
      // "page" scripts never reach the route Keystatic injects; its admin UI
      // is a client:only island, so this rides in with the hydration bundle.
      injectScript(
        "before-hydration",
        `if (location.pathname.startsWith("/keystatic")) import("/src/scripts/keystatic-upload-feedback.js");`
      );
    },
  },
});

export default defineConfig({
  site: "https://south58band.com",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [...(isDev ? [keystatic(), keystaticUploadFeedback()] : []), react()],
  adapter: vercel(),
});