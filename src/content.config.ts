import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

// All per-entry collections are plain JSON files (one file per entry) edited
// either by hand or through the Keystatic panel at /keystatic — see
// keystatic.config.ts, which defines a matching field schema for each of
// these collections. Required fields here mean a missing one fails the
// build instead of shipping a broken page.

// No shows collection: tour dates come from Bandsintown at request time —
// see src/lib/bandsintown.ts.
const songs = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/songs" }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/videos" }),
  schema: z.object({
    title: z.string(),
    tag: z.enum(["LIVE", "REHEARSAL", "SESSION", "ON THE ROAD"]),
    youtubeUrl: z.string().url().optional(),
    order: z.number(),
  }),
});

const pics = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/pics" }),
  schema: z.object({
    label: z.string(),
    ratio: z.enum(["4/5", "1/1", "3/4"]),
    // Repo-relative path under /public, e.g. "/uploads/pics/stage-01.jpg".
    // Left unset while no real photos exist yet — the page falls back to
    // the placeholder pattern.
    photo: z.string().optional(),
    order: z.number(),
  }),
});

const band = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/band" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    portrait: z.string().optional(),
    order: z.number(),
  }),
});

const press = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/press" }),
  schema: z.object({
    kind: z.string(),
    title: z.string(),
    description: z.string(),
    actionLabel: z.string(),
    file: z.string().optional(),
    order: z.number(),
  }),
});

// A testimonial is either a screenshot of a real post or a typed-out quote,
// so both halves are optional on their own and the refine keeps an entry from
// being neither — that would render an empty card.
const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/testimonials" }),
  schema: z
    .object({
      screenshot: z.string().optional(),
      alt: z.string().optional(),
      quote: z.string().optional(),
      source: z.string().optional(),
      order: z.number(),
    })
    .refine((entry) => entry.screenshot || entry.quote, {
      message: "needs either a screenshot or a quote",
    }),
});

// Full-bleed section background: either a video URL or an image that can be
// parallaxed. Shared by every section that offers the choice.
const backgroundMedia = z.object({
  type: z.enum(["video", "image"]),
  videoUrl: z.string().url().optional(),
  image: z.string().optional(),
  parallax: z.boolean(),
});

const site = defineCollection({
  loader: file("./src/content/site.json"),
  schema: z.object({
    bandName: z.string(),
    tagline: z.string(),
    email: z.string().email(),
    phone: z.string(),
    location: z.string(),
    social: z.object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      youtube: z.string().url().optional(),
    }),
    home: z.object({
      heroLine1: z.string(),
      heroLine2: z.string(),
      heroSubcopy: z.string(),
      heroMedia: backgroundMedia,
      whoWeAreCopy: z.string(),
      whoWeAreMedia: backgroundMedia,
      // Keystatic writes null into a URL field that has been cleared.
      featuredVideoUrl: z.string().url().nullish(),
      bookUsCopy: z.string(),
    }),
    // Off until the press material is ready: drops the page from both menus
    // and tells search engines to leave it alone, so an unfinished page can't
    // turn up in results before it launches.
    showPressKit: z.boolean(),
    // The paragraph under each page's heading. Hardcoded, these drifted out
    // of step with the rest of the site — the band page still called it a
    // five-piece long after the lineup changed.
    pageIntros: z.object({
      band: z.string(),
      pics: z.string(),
      videos: z.string(),
      songs: z.string(),
      press: z.string(),
    }),
    showsPage: z.object({
      emptyUpcoming: z.string(),
      emptyPast: z.string(),
      bookingPrompt: z.string(),
      bookingCta: z.string(),
    }),
    bookings: z.object({
      intro: z.string(),
      formNote: z.string(),
      confirmation: z.string(),
    }),
  }),
});

export const collections = { songs, videos, pics, band, press, testimonials, site };
