// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import keystatic from "@keystatic/astro";

import vercel from "@astrojs/vercel";

import react from "@astrojs/react";

// Keystatic injects /keystatic and /api/keystatic as non-prerendered (SSR)
// routes. In local storage mode it has no login of its own, so it is kept to
// `astro dev` — shipping it would leave the panel open to anyone. Once the
// GitHub app is configured it authenticates through GitHub and only
// collaborators with write access can edit, so it is safe to ship, which is
// what puts the panel on the live site. @astrojs/react is required because
// Keystatic's admin UI is a React app mounted with client:only.
//
// Every page is still prerendered except / and /shows, which opt out so their
// Bandsintown dates stay current without a redeploy — @astrojs/vercel is what
// runs those two in production, and they lean on the CDN for caching.
const isDev = process.env.NODE_ENV !== "production";
const keystaticOnline = Boolean(process.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG);
const withKeystatic = isDev || keystaticOnline;

// Keystatic's admin UI ships no busy state for picking a file, which reads as
// a hung panel. The script is pulled in only on the /keystatic routes, so it
// rides along wherever the panel itself runs and nowhere else.
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

  integrations: [...(withKeystatic ? [keystatic(), keystaticUploadFeedback()] : []), react()],
  adapter: vercel(),
});