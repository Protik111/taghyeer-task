export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "daniel-karen",
    name: "Daniel Karen",
    role: "Student of VCAD Borough campus",
    quote:
      "Our team at Victoria College of Arts and Design is passionate about creating innovative projects and generating new ideas. We work with a variety of experts and esteemed companies using a collaborative approach. Located in London's Design District, we have valuable connections within our industry.",
    image: "/images/testimonial-daniel.jpg",
  },
  {
    id: "aisha-bello",
    name: "Aisha Bello",
    role: "Student of VCAD Canary Wharf campus",
    quote:
      "The tutors pushed me to think beyond the brief and the studio culture made it easy to collaborate with students from other courses. It's given me the confidence to pursue a career in the creative industries. It's given me the confidence to pursue a career in the creative industries.",
    image: "/images/testimonial-daniel.jpg",
  },
  {
    id: "marcus-lee",
    name: "Marcus Lee",
    role: "Student of VCAD Borough campus",
    quote:
      "Small class sizes meant I had real one-to-one time with industry-experienced tutors. The connections I made through VCAD's partner network led directly to my first placement. The connections I made through VCAD's partner network led directly to my first placement.",
    image: "/images/testimonial-daniel.jpg",
  },
];
