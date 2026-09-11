export interface BackgroundMedia {
  type: "video" | "image";
  videoUrl?: string;
  image?: string;
  parallax: boolean;
}

// False while the section is still on the placeholder pattern, which is what
// the "[ ... ]" editor hints on the page key off.
export const hasMedia = (media: BackgroundMedia) =>
  media.type === "video" ? !!media.videoUrl : !!media.image;
