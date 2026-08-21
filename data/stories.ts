export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
}

export const stories: Story[] = [
  {
    id: "induction-canary-wharf",
    slug: "induction-vcad-canary-wharf-campus",
    title: "Induction in VCAD Canary Wharf campus",
    excerpt:
      "If you join Victoria College of Arts and Design, you can expect the highest calibre of teaching, cutting-edge facilities, and exceptional industry connections, which will help to prepare you for a rewarding career in the creative and tech industries.",
    image: "/images/story-induction.jpg",
    imageAlt: "Student presenting during induction at VCAD Canary Wharf campus",
  },
  {
    id: "life-at-borough",
    slug: "a-day-in-the-life-at-vcad-borough",
    title: "A day in the life at VCAD Borough",
    excerpt:
      "From studio critiques to industry guest lectures, see what a typical day looks like for a VCAD Borough student and how the campus supports creative practice from first year through to graduation.",
    image: "/images/story-life-borough.jpg",
    imageAlt: "Students sketching artwork together at VCAD Borough campus",
  },
];
