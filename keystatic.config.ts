import { config, fields, collection, singleton } from "@keystatic/core";

// Each collection here mirrors a Zod schema in src/content.config.ts; keep
// both in sync when a field changes on either side.
//
// Saving commits to the repo rather than writing local files, which is what
// lets the panel run on the live site: GitHub supplies the login, so only
// people with write access to the repo can edit. It also means the panel
// shows its sign-in button before the GitHub app exists — that button is how
// the app gets created in the first place. See .env.example.
const storage = { kind: "github", repo: { owner: "ordonezjose", name: "south58" } } as const;
// A section's full-bleed background: a video URL or an image that can be
// parallaxed. `slug` keeps each section's uploads in their own folder.
const backgroundMediaField = (label: string, slug: string) =>
  fields.object(
    {
      type: fields.select({
        label: "Background type",
        options: [
          { label: "Video (looped, muted)", value: "video" },
          { label: "Image", value: "image" },
        ],
        defaultValue: "image",
      }),
      videoUrl: fields.url({
        label: "Background video URL (YouTube link, or a direct video file URL)",
        description:
          "Plays looped and muted. A YouTube link is embedded full-bleed; any other URL is treated as a direct video file.",
        validation: { isRequired: false },
      }),
      image: fields.image({
        label: "Background image",
        directory: `public/uploads/${slug}`,
        publicPath: `/uploads/${slug}/`,
        validation: { isRequired: false },
      }),
      parallax: fields.checkbox({
        label: "Parallax scroll effect (image only)",
        defaultValue: true,
      }),
    },
    { label }
  );

export default config({
  storage,
  collections: {
    // Tour dates are not here: they live in Bandsintown, which the band
    // already keeps up to date and which feeds / and /shows directly.
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
      label: "What people say",
      path: "src/content/testimonials/*",
      format: "json",
      slugField: "slug",
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        screenshot: fields.image({
          label: "Screenshot",
          description:
            "A screenshot of a real post, comment or review. Shown uncropped at whatever shape it is, so the text in it stays readable. Leave empty to type the quote out instead.",
          directory: "public/uploads/testimonials",
          publicPath: "/uploads/testimonials/",
          validation: { isRequired: false },
        }),
        alt: fields.text({
          label: "What the screenshot says",
          description:
            "Read aloud to visitors using a screen reader, and what search engines see — the words inside an image are invisible to both. A short summary is enough.",
          validation: { isRequired: false },
        }),
        quote: fields.text({
          label: "Quote",
          description: "Used only when there is no screenshot.",
          multiline: true,
          validation: { isRequired: false },
        }),
        source: fields.text({
          label: "Source",
          description: '"INSTAGRAM · @HANDLE". Optional under a screenshot that already shows where it came from.',
          validation: { isRequired: false },
        }),
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
            heroMedia: backgroundMediaField("Hero background media", "hero"),
            whoWeAreCopy: fields.text({ label: '"Who we are" copy', multiline: true }),
            whoWeAreMedia: backgroundMediaField('"Who we are" background media', "who-we-are"),
            featuredVideoUrl: fields.url({
              label: "Featured video URL",
              description:
                "The 16:9 video on the homepage. A YouTube link shows its thumbnail and only loads the player when a visitor clicks play; any other URL is treated as a direct video file. Leave empty to keep the placeholder.",
              validation: { isRequired: false },
            }),
            bookUsCopy: fields.text({ label: '"Book us" copy', multiline: true }),
          }),
          showPressKit: fields.checkbox({
            label: "Show the press kit in the menus",
            description:
              "Off while the material is still being put together: the page disappears from the header and footer, and search engines are asked not to list it. The page itself stays reachable by direct link so you can preview it.",
            defaultValue: false,
          }),
          pageIntros: fields.object(
            {
              band: fields.text({ label: "Band page", multiline: true }),
              pics: fields.text({
                label: "Pics page",
                description: "Write {email} anywhere in the text and the booking address appears there as a mail link.",
                multiline: true,
              }),
              videos: fields.text({ label: "Videos page", multiline: true }),
              songs: fields.text({ label: "Song list page", multiline: true }),
              press: fields.text({ label: "Press kit page", multiline: true }),
            },
            { label: "Page intros", description: "The paragraph under each page's heading." }
          ),
          showsPage: fields.object(
            {
              emptyUpcoming: fields.text({
                label: "Empty state — upcoming",
                description: "Shown when there are no upcoming dates.",
                multiline: true,
              }),
              emptyPast: fields.text({
                label: "Empty state — past dates",
                description: "Shown when no past dates have been logged.",
                multiline: true,
              }),
              bookingPrompt: fields.text({
                label: "Booking prompt",
                description: "The line above the button at the bottom of both lists.",
                multiline: true,
              }),
              bookingCta: fields.text({ label: "Booking button label" }),
            },
            { label: "Shows page copy" }
          ),
          bookings: fields.object({
            intro: fields.text({ label: "Bookings intro", multiline: true }),
            formNote: fields.text({ label: "Form note", description: "The small line beside the send button." }),
            confirmation: fields.text({
              label: "Confirmation message",
              description: "Replaces the form once a request has been sent.",
              multiline: true,
            }),
          }),
        }),
      },
    }),
  },
});
