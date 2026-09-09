import { config, fields, collection, singleton } from "@keystatic/core";

// Local-mode Keystatic: content is read from and written straight to the
// files in src/content/ — no external service, no auth, just the panel at
// /keystatic while `astro dev` is running. Each collection here mirrors a
// Zod schema in src/content.config.ts; keep both in sync when a field
// changes on either side.
//
// NOTE: keystatic.com was unreachable from this sandbox (network policy),
// so this file is built from the installed @keystatic/core / @keystatic/astro
// package sources (type declarations + the integration's own code) rather
// than the official walkthrough. The shape below matches the documented
// config/collection/singleton/fields API, but if the panel's UX doesn't
// match what you expected for a field, that's the part worth checking
// against https://keystatic.com/docs yourself.
export default config({
  storage: {
    kind: "local",
  },
  collections: {
    shows: collection({
      label: "Shows",
      path: "src/content/shows/*",
      format: "json",
      slugField: "slug",
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        date: fields.date({ label: "Date" }),
        time: fields.text({ label: "Time", description: '"9:00 PM" or "Played" for past shows' }),
        venue: fields.text({ label: "Venue" }),
        city: fields.text({ label: "City", description: '"Doral, FL"' }),
      },
    }),

    videos: collection({
      label: "Videos",
      path: "src/content/videos/*",
      format: "json",
      slugField: "slug",
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        title: fields.text({ label: "Title" }),
        tag: fields.select({
          label: "Tag",
          options: [
            { label: "Live", value: "LIVE" },
            { label: "Rehearsal", value: "REHEARSAL" },
            { label: "Session", value: "SESSION" },
            { label: "On the road", value: "ON THE ROAD" },
          ],
          defaultValue: "LIVE",
        }),
        youtubeUrl: fields.url({ label: "YouTube URL", validation: { isRequired: false } }),
        order: fields.integer({ label: "Order", defaultValue: 1 }),
      },
    }),

    pics: collection({
      label: "Pics",
      path: "src/content/pics/*",
      format: "json",
      slugField: "slug",
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        label: fields.text({ label: "Label" }),
        ratio: fields.select({
          label: "Aspect ratio",
          options: [
            { label: "4:5", value: "4/5" },
            { label: "1:1", value: "1/1" },
            { label: "3:4", value: "3/4" },
          ],
          defaultValue: "1/1",
        }),
        photo: fields.image({
          label: "Photo",
          directory: "public/uploads/pics",
          publicPath: "/uploads/pics/",
          validation: { isRequired: false },
        }),
        order: fields.integer({ label: "Order", defaultValue: 1 }),
      },
    }),

    band: collection({
      label: "Band",
      path: "src/content/band/*",
      format: "json",
      slugField: "slug",
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        name: fields.text({ label: "Name" }),
        role: fields.text({ label: "Role", description: '"LEAD VOCALS", "GUITAR", etc.' }),
        portrait: fields.image({
          label: "Portrait",
          directory: "public/uploads/band",
          publicPath: "/uploads/band/",
          validation: { isRequired: false },
        }),
        order: fields.integer({ label: "Order", defaultValue: 1 }),
      },
    }),

    press: collection({
      label: "Press kit items",
      path: "src/content/press/*",
      format: "json",
      slugField: "slug",
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        kind: fields.text({ label: "Kind", description: '"ONE SHEET", "PHOTOS", "LOGOS", "VIDEO"' }),
        title: fields.text({ label: "Title" }),
        description: fields.text({ label: "Description", multiline: true }),
        actionLabel: fields.text({ label: "Action label" }),
        file: fields.file({
          label: "File",
          directory: "public/uploads/press",
          publicPath: "/uploads/press/",
          validation: { isRequired: false },
        }),
        order: fields.integer({ label: "Order", defaultValue: 1 }),
      },
    }),

    testimonials: collection({
      label: "Testimonials",
      path: "src/content/testimonials/*",
      format: "json",
      slugField: "slug",
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        quote: fields.text({ label: "Quote", multiline: true }),
        source: fields.text({ label: "Source", description: '"INSTAGRAM · @HANDLE"' }),
        order: fields.integer({ label: "Order", defaultValue: 1 }),
      },
    }),

    songs: collection({
      label: "Song list",
      path: "src/content/songs/*",
      format: "json",
      slugField: "slug",
      schema: {
        slug: fields.slug({ name: { label: "Slug", description: "The song title also becomes the filename slug." } }),
        title: fields.text({ label: "Title" }),
        order: fields.integer({ label: "Order", defaultValue: 1 }),
      },
    }),
  },
  singletons: {
    // Keystatic singletons write their schema as-is to one file. Astro's
    // `file()` loader (src/content.config.ts) reads that same file as an
    // object map keyed by entry id, so every field here is nested under a
    // single "settings" key to line up with `getEntry("site", "settings")`.
    site: singleton({
      label: "Site settings",
      path: "src/content/site",
      format: "json",
      schema: {
        settings: fields.object({
          bandName: fields.text({ label: "Band name" }),
          tagline: fields.text({ label: "Tagline", multiline: true }),
          email: fields.text({ label: "Booking email" }),
          phone: fields.text({ label: "Phone" }),
          location: fields.text({ label: "Location" }),
          social: fields.object({
            instagram: fields.url({ label: "Instagram URL", validation: { isRequired: false } }),
            facebook: fields.url({ label: "Facebook URL", validation: { isRequired: false } }),
            youtube: fields.url({ label: "YouTube URL", validation: { isRequired: false } }),
          }),
          home: fields.object({
            heroLine1: fields.text({ label: "Hero line 1" }),
            heroLine2: fields.text({ label: "Hero line 2" }),
            heroSubcopy: fields.text({ label: "Hero subcopy", multiline: true }),
            whoWeAreCopy: fields.text({ label: '"Who we are" copy', multiline: true }),
            bookUsCopy: fields.text({ label: '"Book us" copy', multiline: true }),
          }),
          bookings: fields.object({
            intro: fields.text({ label: "Bookings intro", multiline: true }),
            formNote: fields.text({ label: "Form note" }),
          }),
        }),
      },
    }),
  },
});
