import type {
  AdmissionsCategory,
  Course,
  CourseKeyDetails,
  CurriculumYear,
} from "@/types/course";

/**
 * Local/static course data.
 *
 * Exposed through `getCourses()` / `getCourseBySlug()` so the data
 * source can later be swapped for a real API without changing the UI
 * that consumes it.
 */

function keyDetails(
  overrides: Partial<CourseKeyDetails> & Pick<CourseKeyDetails, "tuitionFee">,
): CourseKeyDetails {
  return {
    startDate: "November, February",
    studyMode: "Full Time",
    location: "Canary Wharf",
    awardingBody: "Arts University Plymouth",
    ...overrides,
  };
}

/** The entry-requirements boilerplate is genuinely shared across VCAD's
 * degree courses; only the language-requirement score varies. */
function standardAdmissions(ieltsScore: string): AdmissionsCategory[] {
  return [
    {
      label: "Entry Requirements",
      items: [
        {
          title: "Standard Academic Route",
          content: [
            {
              type: "list",
              items: [
                "72 UCAS tariff points (or above) or 60 Credit Ofqual qualification at Level 3",
                "For international qualifications, ECCTIS (formerly NARIC) will be used to establish equivalence to their comparable level in the UK.",
              ],
            },
            {
              type: "heading",
              text: "All applicants must submit a personal ‘portfolio’, using any one of the following formats",
            },
            {
              type: "list",
              items: [
                "A video or audio recording; using speech, animation, images, or any other appropriate content the candidate wishes. The video must be no less than one minute and no more than two minutes in length.",
                "A digital portfolio of images and writing using Word, Canva, PowerPoint or any other suitable software of the applicant’s choice.",
              ],
            },
            {
              type: "paragraph",
              text: "In the portfolio, applicants should clearly evidence and explain the reasons they wish to study their chosen subject and how they believe their studies can positively impact their lives in the future.",
            },
          ],
        },
        {
          title: "Non-standard Academic Route",
          content: [
            {
              type: "paragraph",
              text: "Applicants without standard qualifications are considered on an individual basis, taking into account relevant work experience, an interview, and the required portfolio submission.",
            },
          ],
        },
        {
          title: "Documents Required",
          content: [
            {
              type: "list",
              items: [
                "Proof of identity (passport or national ID)",
                "Academic transcripts or equivalent qualification certificates",
                "Personal portfolio submission",
              ],
            },
          ],
        },
        {
          title: "Additional Info",
          content: [
            {
              type: "paragraph",
              text: "Applications are reviewed on a rolling basis. Shortlisted applicants may be invited to an interview as part of the selection process.",
            },
          ],
        },
      ],
    },
    {
      label: "English Language Requirements",
      items: [
        {
          title: "IELTS (or equivalent)",
          content: [
            {
              type: "paragraph",
              text: `Applicants whose first language is not English must achieve an overall IELTS score of ${ieltsScore} (or an approved equivalent), with no individual component below 5.5.`,
            },
          ],
        },
        {
          title: "Exemptions",
          content: [
            {
              type: "paragraph",
              text: "Applicants who have completed a UK degree, or secondary education taught in English in a majority English-speaking country, may be exempt from providing a separate English language test.",
            },
          ],
        },
      ],
    },
    {
      label: "Additional Info",
      items: [
        {
          title: "Fees & Funding",
          content: [
            {
              type: "paragraph",
              text: "Tuition fees are payable annually and student finance, scholarships and payment plans are available for eligible applicants — contact the admissions team for details.",
            },
          ],
        },
        {
          title: "Deferred Entry",
          content: [
            {
              type: "paragraph",
              text: "Deferred entry requests are considered on a case-by-case basis and should be submitted in writing to the admissions team.",
            },
          ],
        },
      ],
    },
  ];
}

function foundationYear(modules: CurriculumYear["modules"]): CurriculumYear {
  return { year: "Foundation Year", modules };
}

const courses: Course[] = [
  {
    id: "fashion-design",
    slug: "fashion-design",
    title: "BA (Hons) Fashion Design",
    school: "School of Fashion",
    duration: "4 Years",
    category: "Fashion",
    image: "/images/courses-hero-right.png",
    imageAlt: "Students reviewing fabric samples in a fashion design studio",
    description:
      "This course introduces students to creative practice, focusing on theoretical, practical and technical components. ",
    overview:
      "This course introduces students to creative practice, focusing on theoretical, practical, and technical components. In early stages, students develop essential skills for academic success and personal growth, emphasizing reflection and technical skills like visual communication. As they progress, they engage with methodologies, enhancing understanding of processes and fostering critical thinking, collaboration, and problem-solving.",
    gallery: [
      "/images/course-fashion-media.jpg",
      "/images/gallery-tailoring.png",
      "/images/story-induction.jpg",
    ],
    keyDetails: keyDetails({ tuitionFee: "£ 9535", location: "Canary Wharf" }),
    curriculum: [
      foundationYear([
        {
          code: "FD01",
          title: "Fundamentals",
          credits: 30,
          description:
            "This course introduces students to creative practice, focusing on theoretical, practical, and technical components. In early stages, students develop essential skills for academic success and personal growth, emphasizing reflection and technical skills like visual communication.",
        },
        {
          code: "FD02",
          title: "Thinking Through Making",
          credits: 30,
          description:
            "Students explore ideas through hands-on making, using material experimentation to develop a personal design process and a working studio practice.",
        },
        {
          code: "FD03",
          title: "Developing Specialist Practice",
          credits: 30,
          description:
            "Building on foundational skills, students begin to specialise, developing a body of work that reflects their emerging design identity.",
        },
        {
          code: "FD04",
          title: "Specialist Project",
          credits: 30,
          description:
            "A self-directed project that consolidates the year's learning into a resolved outcome, presented and critiqued in a studio review.",
        },
      ]),
      {
        year: "First Year",
        modules: [
          {
            code: "FY01",
            title: "Design Principles",
            credits: 20,
            description:
              "Core principles of garment design, silhouette and construction.",
          },
          {
            code: "FY02",
            title: "Textiles & Materials",
            credits: 20,
            description:
              "An introduction to fabric properties, sourcing and sustainable materials.",
          },
          {
            code: "FY03",
            title: "Pattern Cutting",
            credits: 20,
            description:
              "Foundational flat pattern cutting and toile development.",
          },
        ],
      },
      {
        year: "Second Year",
        modules: [
          {
            code: "SY01",
            title: "Collection Development",
            credits: 30,
            description:
              "Developing a cohesive mini-collection from concept through to sample.",
          },
          {
            code: "SY02",
            title: "Industry Placement",
            credits: 30,
            description:
              "A supervised placement with an industry partner to build professional experience.",
          },
        ],
      },
      {
        year: "Third Year",
        modules: [
          {
            code: "TY01",
            title: "Final Collection",
            credits: 40,
            description:
              "An independent final collection, culminating in the graduate showcase.",
          },
          {
            code: "TY02",
            title: "Portfolio & Professional Practice",
            credits: 20,
            description:
              "Preparing a professional portfolio and business plan for entry into the industry.",
          },
        ],
      },
    ],
    admissions: standardAdmissions("6.0"),
  },
  {
    id: "fashion-media-marketing",
    slug: "fashion-media-and-marketing",
    title: "BA (Hons) Fashion Media and Marketing",
    school: "School of Fashion",
    duration: "3 Years",
    category: "Media",
    image: "/images/course-fashion-media.jpg",
    imageAlt: "Fashion media students planning a marketing campaign",
    description:
      "Students explore the media and marketing landscape of the fashion industry, building skills.",
    overview:
      "Students explore the media and marketing landscape of the fashion industry, building skills in brand strategy, content creation and campaign development across print and digital channels. As they progress, they apply these skills to live briefs with industry partners, building an employable, portfolio-ready practice.",
    gallery: [
      "/images/gallery-seminar.jpg",
      "/images/gallery-studio.jpg",
      "/images/story-induction.jpg",
    ],
    keyDetails: keyDetails({ tuitionFee: "£ 9250", location: "Canary Wharf" }),
    curriculum: [
      foundationYear([
        {
          code: "FD01",
          title: "Fundamentals",
          credits: 30,
          description:
            "An introduction to the fashion media landscape, brand storytelling and audience.",
        },
        {
          code: "FD02",
          title: "Thinking Through Making",
          credits: 30,
          description:
            "Hands-on content creation across photography, styling and social formats.",
        },
        {
          code: "FD03",
          title: "Developing Specialist Practice",
          credits: 30,
          description:
            "Developing a personal editorial or marketing voice through applied briefs.",
        },
        {
          code: "FD04",
          title: "Specialist Project",
          credits: 30,
          description:
            "A self-directed campaign project presented in a studio review.",
        },
      ]),
      {
        year: "First Year",
        modules: [
          {
            code: "FY01",
            title: "Brand Strategy",
            credits: 20,
            description:
              "Core principles of brand positioning and audience strategy.",
          },
          {
            code: "FY02",
            title: "Digital Content Creation",
            credits: 20,
            description:
              "Producing content for social, editorial and campaign contexts.",
          },
          {
            code: "FY03",
            title: "Fashion Communication",
            credits: 20,
            description:
              "Writing and visual storytelling for fashion audiences.",
          },
        ],
      },
      {
        year: "Second Year",
        modules: [
          {
            code: "SY01",
            title: "Campaign Development",
            credits: 30,
            description:
              "Developing an integrated marketing campaign from brief to delivery.",
          },
          {
            code: "SY02",
            title: "Industry Placement",
            credits: 30,
            description: "A supervised placement with an industry partner.",
          },
        ],
      },
      {
        year: "Third Year",
        modules: [
          {
            code: "TY01",
            title: "Final Major Project",
            credits: 40,
            description:
              "An independent campaign project culminating in the graduate showcase.",
          },
          {
            code: "TY02",
            title: "Portfolio & Professional Practice",
            credits: 20,
            description:
              "Preparing a professional portfolio for entry into the industry.",
          },
        ],
      },
    ],
    admissions: standardAdmissions("6.0"),
  },
  {
    id: "graphic-design",
    slug: "graphic-design",
    title: "BA (Hons) Graphic Design",
    school: "School of Design",
    duration: "3 Years",
    category: "Graphic Design",
    image: "/images/course-graphic-design.jpg",
    imageAlt: "A student reading a visual communication reference book",
    description:
      "A studio-based course covering typography, branding and visual communication, preparing.",
    overview:
      "A studio-based course covering typography, branding and visual communication, preparing students to design across print, digital and motion contexts for real-world briefs. Students build a professional portfolio through live projects with industry partners.",
    gallery: [
      "/images/gallery-workshop.jpg",
      "/images/gallery-studio.jpg",
      "/images/courses-showcase.jpg",
    ],
    keyDetails: keyDetails({ tuitionFee: "£ 9250", location: "Borough" }),
    curriculum: [
      foundationYear([
        {
          code: "FD01",
          title: "Fundamentals",
          credits: 30,
          description:
            "An introduction to visual language, layout and typographic principles.",
        },
        {
          code: "FD02",
          title: "Thinking Through Making",
          credits: 30,
          description:
            "Hands-on studio work exploring print, screen and material outcomes.",
        },
        {
          code: "FD03",
          title: "Developing Specialist Practice",
          credits: 30,
          description:
            "Developing a personal design practice through applied briefs.",
        },
        {
          code: "FD04",
          title: "Specialist Project",
          credits: 30,
          description: "A self-directed project presented in a studio review.",
        },
      ]),
      {
        year: "First Year",
        modules: [
          {
            code: "FY01",
            title: "Typography",
            credits: 20,
            description: "Core typographic systems, grids and hierarchy.",
          },
          {
            code: "FY02",
            title: "Brand Identity",
            credits: 20,
            description: "Designing visual identity systems for real briefs.",
          },
          {
            code: "FY03",
            title: "Digital Design",
            credits: 20,
            description: "Interface and interaction design fundamentals.",
          },
        ],
      },
      {
        year: "Second Year",
        modules: [
          {
            code: "SY01",
            title: "Motion & Interaction",
            credits: 30,
            description: "Designing for screen-based and time-based media.",
          },
          {
            code: "SY02",
            title: "Industry Placement",
            credits: 30,
            description: "A supervised placement with an industry partner.",
          },
        ],
      },
      {
        year: "Third Year",
        modules: [
          {
            code: "TY01",
            title: "Final Major Project",
            credits: 40,
            description:
              "An independent design project culminating in the graduate showcase.",
          },
          {
            code: "TY02",
            title: "Portfolio & Professional Practice",
            credits: 20,
            description:
              "Preparing a professional portfolio for entry into the industry.",
          },
        ],
      },
    ],
    admissions: standardAdmissions("6.0"),
  },
  {
    id: "business-management",
    slug: "business-and-management",
    title: "BSc (Hons) Business Management",
    school: "School of Business",
    duration: "1 Year",
    category: "Business",
    image: "/images/course-business-management.jpg",
    imageAlt: "Business and management students in a seminar discussion",
    description:
      "This course introduces students to creative practice, focusing on theoretical, practical and technical components.",
    overview:
      "This course introduces students to creative practice, focusing on theoretical, practical, and technical components. In early stages, students develop essential skills for academic success and personal growth, emphasizing reflection and technical skills like visual communication. As they progress, they engage with methodologies, enhancing understanding of processes and fostering critical thinking, collaboration, and problem-solving.",
    gallery: [
      "/images/gallery-seminar.jpg",
      "/images/courses-showcase.jpg",
      "/images/story-induction.jpg",
    ],
    keyDetails: keyDetails({
      tuitionFee: "£ 9535",
      studyMode: "Full Time",
      location: "Canary Wharf",
    }),
    curriculum: [
      foundationYear([
        {
          code: "FD01",
          title: "Fundamentals",
          credits: 30,
          description:
            "This course introduces students to creative practice, focusing on theoretical, practical, and technical components. In early stages, students develop essential skills for academic success and personal growth, emphasizing reflection and technical skills like visual communication.",
        },
        {
          code: "FD02",
          title: "Thinking Through Making",
          credits: 30,
          description:
            "Applying business thinking to practical, project-based briefs.",
        },
        {
          code: "FD03",
          title: "Developing Specialist Practice",
          credits: 30,
          description:
            "Building specialist knowledge in a chosen area of business practice.",
        },
        {
          code: "FD04",
          title: "Specialist Project",
          credits: 30,
          description:
            "A self-directed project consolidating the year's learning.",
        },
      ]),
    ],
    admissions: standardAdmissions("5.5"),
  },
];

export function getCourses(): Course[] {
  return courses;
}

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}
