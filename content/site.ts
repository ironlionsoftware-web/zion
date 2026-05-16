/**
 * Central content and site configuration.
 * Replace placeholders (email, phone, social URLs, domain) before launch.
 */

export type NavItem = {
  href: string;
  label: string;
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
  sections: { heading?: string; paragraphs: string[] }[];
};

export const site = {
  name: "Iron Lion Fitness & Healing",
  shortName: "Iron Lion",
  tagline: "Movement, energy, and plant-forward care—rooted in respect for every body.",
  description:
    "Holistic fitness, Reiki, and mindful coaching in an inclusive, trauma-aware space. Mobile sessions and education coming online with our new site.",
  /** Production URL for metadata and sitemap; update when domain is live. */
  url: "https://www.ironlionfitnessandhealing.com",
  contact: {
    /** Replace with your public business email */
    email: "hello@ironlionfitnessandhealing.com",
    /** Replace with real phone */
    phoneDisplay: "(555) 000-0000",
    phoneTel: "+15550000000",
    /** Optional — city/region only is fine for Phase 1 */
    serviceArea: "Pacific Northwest · mobile & virtual options",
    intro:
      "Use the options below to reach us. If you prefer a contact form, we can wire a third-party endpoint (e.g. Formspree) in a small follow-up—Phase 1 keeps it simple with mailto and phone.",
  },
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/reiki", label: "Reiki" },
    { href: "/contact", label: "Contact" },
  ] satisfies NavItem[],
  footerNav: [
    { href: "/legal/privacy", label: "Privacy" },
    { href: "/legal/terms", label: "Terms" },
  ] satisfies NavItem[],
  home: {
    heroEyebrow: "Holistic fitness & energy work",
    heroTitle: "Strength, stillness, and care that meets you where you are.",
    heroLead:
      "Personal training, Reiki, and education grounded in consent, clarity, and inclusive practice—whether you are returning to movement or deepening your inner work.",
    aboutTitle: "Why Iron Lion",
    aboutBody: [
      "Iron Lion is built around the idea that healing and fitness are not one-size templates. Sessions honor your pace, your nervous system, and your goals—blending practical strength work with breath, presence, and energy practices when they serve you.",
      "This site is a fresh home for our public offering. Shop and booking flows will land here in a later phase; for now, reach out directly and we will route you to the right next step.",
    ],
    ctaTitle: "Ready when you are",
    ctaBody:
      "Tell us what you are working toward—mobility, stress relief, Reiki curiosity, or something else—and we will follow up with options.",
  },
  servicesIntro: {
    title: "Services",
    lead: "Overview of how we work together today. Details evolve with your needs; these pages are a starting map, not a rigid menu.",
  },
  reiki: {
    title: "Reiki & energy work",
    sections: [
      {
        heading: "What Reiki is (here)",
        paragraphs: [
          "Reiki is a gentle, non-invasive practice of channeling universal life energy to support balance and ease. It is not a substitute for medical or mental health care; it complements your whole-person plan.",
          "Sessions may include light touch or hands hovering, always with clear consent and room to change your mind at any time.",
        ],
      },
      {
        heading: "What you might notice",
        paragraphs: [
          "People often describe warmth, tingling, deep rest, or emotional release. Others notice very little during the session and sleep better afterward. Both are normal.",
        ],
      },
      {
        heading: "Education & lineage",
        paragraphs: [
          "We are transparent about training, scope of practice, and referrals when something is outside our wheelhouse. Ask questions—curiosity is welcome.",
        ],
      },
    ],
  },
  legal: {
    privacySummary:
      "This placeholder page will be replaced with counsel-reviewed language describing what data this site collects (if any), analytics, and third parties.",
    termsSummary:
      "This placeholder page will be replaced with terms of use for the website and any future commerce or booking features.",
  },
} as const;

export const services: Service[] = [
  {
    slug: "holistic-personal-training",
    title: "Holistic personal training",
    summary:
      "Strength, mobility, and conditioning with room for recovery, nervous-system awareness, and sustainable progression.",
    sections: [
      {
        paragraphs: [
          "Training plans meet you at your current capacity. We prioritize form, joint kindness, and workouts that fit real life—not all-or-nothing streaks.",
        ],
      },
      {
        heading: "Good fit if…",
        paragraphs: [
          "You want coaching that respects injuries, chronic pain, or neurodivergent needs; you are rebuilding after time off; or you want a steady partner for accountability without shame.",
        ],
      },
    ],
  },
  {
    slug: "reiki-sessions",
    title: "Reiki sessions",
    summary:
      "In-person or distance sessions focused on grounding, integration, and consent-led practice.",
    sections: [
      {
        paragraphs: [
          "Sessions are paced slowly, with check-ins before and after. You remain in charge of touch, silence, and breaks.",
        ],
      },
      {
        heading: "Booking note",
        paragraphs: [
          "Online scheduling will connect here in a later phase. For now, use the contact page and we will coordinate timing.",
        ],
      },
    ],
  },
  {
    slug: "education-workshops",
    title: "Education & workshops",
    summary:
      "Short-form learning on Reiki basics, plant-forward living narratives, and embodied practices—without dogma.",
    sections: [
      {
        paragraphs: [
          "Workshops emphasize accessibility and respect for diverse belief systems. Content is informational and experiential, not prescriptive medical advice.",
        ],
      },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getServiceSlugs(): { slug: string }[] {
  return services.map((s) => ({ slug: s.slug }));
}
