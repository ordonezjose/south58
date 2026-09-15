import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

// All per-entry collections are plain JSON files (one file per entry) edited
// either by hand or through the Keystatic panel at /keystatic — see
// keystatic.config.ts, which defines a matching field schema for each of
// these collections. Required fields here mean a missing one fails the
// build instead of shipping a broken page.

const shows = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/shows" }),
  schema: z.object({
    date: z.coerce.date(),
    time: z.string(),
    venue: z.string(),
    city: z.string(),
  }),
});

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

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/testimonials" }),
  schema: z.object({
    quote: z.string(),
    source: z.string(),
    order: z.number(),
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
    showsPage: z.object({
      emptyUpcoming: z.string(),
      emptyPast: z.string(),
      bookingPrompt: z.string(),
      bookingCta: z.string(),
    }),
    bookings: z.object({
      intro: z.string(),
      formNote: z.string(),
    }),
  }),
});

export const collections = { shows, songs, videos, pics, band, press, testimonials, site };
