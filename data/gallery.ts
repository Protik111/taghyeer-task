export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export const courseGalleryImages: GalleryImage[] = [
  { id: "painting", src: "/images/gallery-painting.png", alt: "A student painting in the studio" },
  { id: "seminar", src: "/images/gallery-seminar.jpg", alt: "Students attending a seminar and guest lecture" },
  { id: "tailoring", src: "/images/gallery-tailoring.png", alt: "Fashion students working on a garment pattern" },
  { id: "induction", src: "/images/gallery-induction.jpg", alt: "A student presenting during induction" },
  { id: "studio", src: "/images/gallery-studio.jpg", alt: "Students sketching artwork in the design studio" },
  { id: "workshop", src: "/images/gallery-workshop.jpg", alt: "Students collaborating on a shared workshop bench" },
];
