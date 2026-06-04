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

export type ShopProduct = {
  slug: string;
  name: string;
  priceCents: number;
  imageSrc: string;
  imageAlt: string;
};

export type HealingServiceItem = {
  slug: string;
  label: string;
  /** book → pay then schedule; shop → apothecary; donation → pay-what-you-can; classes → class catalog */
  kind: "book" | "shop" | "donation" | "classes";
  /** Fixed price for bookable services (card checkout before scheduling) */
  priceCents?: number;
  /** Pay-what-you-can range for bookable services (e.g. card readings) */
  slidingScale?: SlidingScale;
};

export type SlidingScale = {
  minCents: number;
  maxCents: number;
  defaultCents: number;
};

export type BookableService = HealingServiceItem & {
  priceCents: number;
  slidingScale?: SlidingScale;
};

export type ClassOffering = {
  slug: string;
  title: string;
  summary: string;
  schedule: string;
  format: string;
  location: string;
  priceCents: number;
  spotsRemaining?: number;
};

export type NaturePhoto = {
  src: string;
  alt: string;
};

/** Your Dominica photography, used across the site */
export const dominicaPhotos = [
  {
    src: "/images/dominica/01-scotts-head.png",
    alt: "Aerial view of Scotts Head peninsula and turquoise bays in Dominica",
  },
  {
    src: "/images/dominica/02-river-canoe.png",
    alt: "Canoe on a calm jungle river in Dominica",
  },
  {
    src: "/images/dominica/03-volcanic-lake.png",
    alt: "Volcanic lake and rainforest mountains in Dominica",
  },
  {
    src: "/images/dominica/04-island-road.png",
    alt: "Winding road through tropical hills in Dominica",
  },
  {
    src: "/images/dominica/05-tropical-fruits.png",
    alt: "Fresh tropical fruits and sugarcane from Dominica",
  },
  {
    src: "/images/dominica/06-valley-road.png",
    alt: "Road through a lush green valley in Dominica",
  },
  {
    src: "/images/dominica/07-waterfall.png",
    alt: "Waterfall flowing into a clear pool in the Dominica rainforest",
  },
  {
    src: "/images/dominica/08-river-boat.png",
    alt: "Boat on a river surrounded by tropical forest in Dominica",
  },
  {
    src: "/images/dominica/09-mountain-valley.png",
    alt: "Mountain valley and forest under clouds in Dominica",
  },
  {
    src: "/images/dominica/10-iron-lion-zion.png",
    alt: "Iron Lion Zion building in Dominica with Rasta colors",
  },
  {
    src: "/images/dominica/11-coastline.png",
    alt: "Black sand beach and turquoise coast in Dominica",
  },
  {
    src: "/images/dominica/12-trafalgar-falls.png",
    alt: "Twin waterfalls of Trafalgar Falls in Dominica, with lush cliffs and volcanic rocks",
  },
] as const satisfies readonly NaturePhoto[];

/** Austin-area landscapes for the home gallery (5 of 12 slots). */
export const austinLandscapePhotos = [
  {
    src: "/images/austin/landscapes/01-cave-forest.png",
    alt: "Sunlit forest viewed from inside a mossy cave in Central Texas",
  },
  {
    src: "/images/austin/landscapes/02-hamilton-pool.png",
    alt: "Hamilton Pool Preserve waterfall and turquoise pool near Austin, Texas",
  },
  {
    src: "/images/austin/landscapes/03-barton-springs.png",
    alt: "Barton Springs Pool on a sunny day in Austin, Texas",
  },
  {
    src: "/images/austin/austin-skyline-sunset.png",
    alt: "Austin skyline at sunset along Lady Bird Lake with Congress Avenue Bridge and kayakers on the water",
  },
  {
    src: "/images/austin/landscapes/05-greenbelt-creek.png",
    alt: "Rocky creek and limestone cliffs along the Barton Creek Greenbelt",
  },
] as const satisfies readonly NaturePhoto[];

/** Home “Landscapes” gallery: five Austin scenes + seven Dominica photos. */
export const natureGalleryPhotos = [
  ...austinLandscapePhotos,
  ...dominicaPhotos.slice(5),
] as const satisfies readonly NaturePhoto[];

export const site = {
  name: "Iron Lion Fitness & Holistic Healing",
  /** Written brand line shown next to the lion emblem */
  brandName: "Iron Lion Fitness and Holistic Healing",
  shortName: "Iron Lion",
  /** Shown under the header lockup (with shortName, reads as the full business name). */
  headerSubtitle: "Fitness & Holistic Healing",
  tagline: "Movement, energy, and plant forward care rooted in respect for every body.",
  description:
    "Holistic fitness, Reiki, and healing. Book sessions, shop plant medicine, and register online.",
  /** Production URL for metadata and sitemap; update when domain is live. */
  url: "https://www.ironlionfitnessandhealing.com",
  contact: {
    /** Public inbox for shop orders, bookings, and general inquiries */
    email: "ironlionhealing@gmail.com",
    phoneDisplay: "(713) 815 0276",
    phoneTel: "+17138150276",
    phoneNote: "Text only",
    serviceArea: "Greater Austin area. Nationwide by arrangement.",
    intro:
      "Email or call for shop orders, session bookings, retreat questions, or anything else. We will reply with availability and next steps.",
  },
  social: {
    instagram: "https://www.instagram.com/ironlion_healing/",
    facebook: "https://www.facebook.com/IronLionFitnessandHolisticHealingLLC",
    youtube: "https://www.youtube.com/channel/UC23k2d4yml-_3-a4efR0xFQ/featured",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/fitness-training", label: "Fitness Training" },
    { href: "/healing-services", label: "Healing Services & Classes" },
    { href: "/find-your-path", label: "Find your path" },
    { href: "/retreat", label: "Retreat" },
    { href: "/shop", label: "Shop plant medicine" },
    { href: "/contact", label: "Contact Us" },
  ] satisfies NavItem[],
  footerNav: [
    { href: "/legal/privacy", label: "Privacy" },
    { href: "/legal/terms", label: "Terms" },
  ] satisfies NavItem[],
  home: {
    /** Short mantra shown under the hero title (Sage & Soul to style). */
    heroMantra: ["Move", "Heal", "Rise"],
    heroEyebrow: "Holistic Fitness, Energy Work & Plant Medicine",
    heroTitle: "Strength, stillness, and care that meets you where you are.",
    heroLead:
      "Personal training, Reiki, and education grounded in consent, clarity, and inclusive practice.",
    aboutTitle: "Why Iron Lion",
    aboutBody: [
      "Iron Lion is built around the idea that healing and fitness are not one size templates. Sessions honor your pace, your nervous system, and your goals while blending practical strength work with breath, presence, and energy practices when they serve you.",
      "Register once, then book healing sessions, shop plant medicine, or make a donation, all through this site. We follow up by email or text with next steps for scheduling, pickup, or shipping.",
    ],
    ctaTitle: "Ready when you are",
    ctaBody:
      "Tell us what you are working toward, including mobility, stress relief, Reiki curiosity, or something else, and we will follow up with options.",
    aboutImage: dominicaPhotos[2].src,
    heroBackdrop: dominicaPhotos[0].src,
    ctaBackdrop: dominicaPhotos[6].src,
  },
  nature: {
    title: "Landscapes that ground our work",
    lead:
      "From Dominica's mountains, rivers, and coast to Austin's springs, trails, and skyline, the places where we move, heal, and reconnect with the land.",
    label: "Dominica & Austin, Texas",
    photos: dominicaPhotos,
    galleryPhotos: natureGalleryPhotos,
  },
  /**
   * Calendly scheduling page URL.
   * In Calendly: Share → Copy link (e.g. https://calendly.com/your-username).
   * Leave empty until you have a live page, book links fall back to Contact.
   */
  calendly: {
    url: "https://calendly.com/ironlionsoftware",
    heading: "Schedule a session",
    lead: "Choose your practitioner, then pick a time for Reiki, personal training, pranayama, or a consultation. Questions before you book? Email us anytime.",
  },
  practitioners: {
    legend: "Choose your practitioner",
    lead: "Both practitioners offer holistic healing and personal training. Select one practitioner, or book a dual session with both at the same time.",
    dualSession: {
      slug: "dual",
      name: "Dual session (both practitioners)",
      title: "Johari Templin & Johnny Lona together",
      description: "One shared session with both practitioners present at the same time.",
      /** Calendly event for dual sessions — override with CALENDLY_URL_DUAL_SESSION env var */
      calendlyUrl: "https://calendly.com/ironlionsoftware",
      /** Charged as base service price × this multiplier (typically 2) */
      priceMultiplier: 2,
    },
    list: [
      {
        slug: "johari-templin-jr",
        name: "Johari Templin",
        title: "Holistic healer & trainer",
        /** Per-practitioner Calendly page, override with CALENDLY_URL_JOHARI_TEMPLIN_JR env var */
        calendlyUrl: "https://calendly.com/ironlionsoftware/johari-templin-jr",
      },
      {
        slug: "johnny-lona",
        name: "Johnny Lona",
        title: "Holistic healer & trainer",
        calendlyUrl: "https://calendly.com/ironlionsoftware/johnny-lona",
      },
      {
        slug: "pierre-middleton",
        name: "Pierre Middleton",
        title: "Holistic healer & trainer",
        calendlyUrl: "https://calendly.com/ironlionsoftware/pierre-middleton",
      },
    ],
  },
  registration: {
    title: "Client registration",
    intro:
      "Please share your contact details so we can confirm your visit, order, or donation and send helpful updates.",
    submitLabel: "Continue",
    marketingConsentLabel:
      "I agree to receive emails and texts from Iron Lion about sessions, offers, and wellness updates. I can unsubscribe anytime.",
  },
  payments: {
    planLegend: "Payment option",
    payInFullLabel: "Pay in full",
    payInFullHint: "One time card payment",
    installmentsLabel: "Pay in installments",
    installmentsHint: "Klarna or Affirm at checkout when you qualify (US)",
    serviceLineDescription: "Iron Lion healing service",
    serviceCheckoutTitle: "Pay for your service",
    serviceCheckoutIntro:
      "Choose your practitioner (or a dual session with both), complete payment below, then schedule on Calendly. Installment options appear on Stripe checkout when eligible.",
    serviceSuccessHint:
      "Payment received. Schedule your session next on Calendly.",
    classSuccessHint:
      "You are registered for this class. We will email you with any preparation details and reminders before the first session.",
  },
  donation: {
    title: "Donation based service",
    intro:
      "Support donation based healing work with a contribution between $45 and $120. Choose the amount that fits your situation, then complete payment securely through Stripe.",
    checkoutDescription: "Donation based healing service contribution",
    minCents: 4500,
    maxCents: 12000,
    defaultCents: 7500,
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
          "Reiki is a gentle, non invasive practice of channeling universal life energy to support balance and ease. It is not a substitute for medical or mental health care; it complements your whole person plan.",
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
          "We are transparent about training, scope of practice, and referrals when something is outside our wheelhouse. Ask questions. Curiosity is welcome.",
        ],
      },
    ],
  },
  fitnessTraining: {
    title: "Fitness Training",
    dominicaPhoto: dominicaPhotos[3],
    dominicaCaption: "Dominica",
    austinPhoto: {
      src: "/images/austin/austin-panorama.png",
      alt: "Panoramic view of downtown Austin at sunset across Lady Bird Lake",
    },
    austinCaption: "Austin Texas",
    sections: [
      {
        paragraphs: [
          "Our coaching blends strength, mobility, and stability. Paced for your joints, nervous system, and schedule. We care about consistency without burnout, form without shame, and goals that honor your reality.",
        ],
      },
      {
        heading: "What to expect",
        paragraphs: [
          "Sessions adapt week to week. You will get clear options, regressions when something does not serve you, and space to communicate boundaries and energy levels.",
          "As well as help with nutrition, lifestyle structure, and thought process.",
        ],
      },
      {
        heading: "Good fit if…",
        paragraphs: [
          "You want coaching that respects injuries, chronic pain, or neurodivergent needs, you are rebuilding after time off, if you want a steady partner for accountability, or if youre looking to excel athletically and need to be pushed. We welcome anyone at any stage of fitness.",
        ],
      },
    ],
    booking: {
      heading: "Book a training session",
      lead: "Choose your trainer, then register (if you have not already) and schedule on Calendly.",
      trainerLegend: "Choose your trainer",
      trainerSlugs: ["johari-templin-jr", "johnny-lona", "pierre-middleton"],
    },
  },
  healingServices: {
    title: "Healing Services & Classes",
    intro:
      "Iron Lion brings together holistic fitness, Reiki and energy work, plant medicine, classes, and guided support so you can move, heal, and grow with care that honors your whole self. We aim to meet you with clarity, respect, and practical tools, not quick fixes or pressure. Start by scheduling a consultation to build a holistic health plan that covers mind, body, and spirit: clear structure for your goals, practices that fit your life, and attention to the root causes of whatever it is that you are working with. Whether it be mental, physical, or spiritual. Every session is consent led and works alongside your schedule, as well as your personal, cultural, and spiritual beliefs. Services are available to all ages.",
    services: [
      { slug: "reiki", label: "Reiki & Frequency tuning", kind: "book", priceCents: 12000 },
      { slug: "consultation", label: "Consultation", kind: "book", priceCents: 4500 },
      {
        slug: "help-sessions",
        label: "H.e.l.p. sessions (channelled insight, spiritual/mental coaching)",
        kind: "book",
        priceCents: 12000,
      },
      { slug: "herbs-seamoss", label: "Herbs & seamoss", kind: "shop" },
      { slug: "plant-medicine-ceremonies", label: "Plant medicine ceremonies", kind: "book", priceCents: 12000 },
      { slug: "card-readings", label: "Card readings", kind: "book", slidingScale: { minCents: 4500, maxCents: 12000, defaultCents: 7500 } },
      { slug: "classes", label: "Classes", kind: "classes" },
      { slug: "donation-based", label: "Donation based service", kind: "donation" },
    ] satisfies HealingServiceItem[],
    classCatalog: {
      pageTitle: "Classes",
      pageLead: "Workshops and group sessions are on the way.",
      emptyMessage: "Classes are coming soon!",
      classes: [] as ClassOffering[],
    },
    plantMedicineCeremony: {
      serviceSlug: "plant-medicine-ceremonies",
      legend: "Choose your ceremony",
      lead: "Select the plant medicine ceremony that fits your intention.",
      options: [
        {
          slug: "hape",
          label: "Hape",
          summary: "Sacred tobacco snuff ceremony for grounding, clarity, and prayer.",
        },
        {
          slug: "sananga",
          label: "Sananga",
          summary: "Traditional medicinal eye drops used for vision work and energetic clearing.",
        },
        {
          slug: "soul-flower",
          label: "Soul Flower",
          summary:
            "Cannabreathwork ceremony: deep breathing and release with cannabis in a held, consent led space.",
        },
        {
          slug: "ayavine",
          label: "Ayavine",
          summary:
            "Ayahuasca caapi vine ceremony. May support neurodegenerative conditions, depression, anxiety, and related nervous system patterns.",
        },
      ],
    },
    reikiAddOn: {
      serviceSlug: "reiki",
      priceCents: 4500,
      legend: "Optional add-on",
      lead: "Choose one or more optional enhancements for your Reiki session (+$45 each).",
      noneLabel: "No add-on",
      noneSummary: "Reiki & frequency tuning only.",
      options: [
        {
          slug: "hape",
          label: "Hape",
          summary: "Sacred tobacco snuff for grounding, clarity, and prayer with your session.",
        },
        {
          slug: "sananga",
          label: "Sananga",
          summary: "Traditional medicinal eye drops for vision work and energetic clearing.",
        },
        {
          slug: "soul-flower",
          label: "Soul Flower",
          summary:
            "Cannabreathwork: deep breathing and release with cannabis, woven into your Reiki session.",
        },
        {
          slug: "ayavine",
          label: "Ayavine",
          summary:
            "Ayahuasca caapi vine infused Reiki. May support neurodegenerative conditions, depression, anxiety, and related nervous system patterns.",
        },
      ],
    },
    sections: [
      {
        heading: "Reiki & related offerings",
        paragraphs: [
          "We believe that gaining an understanding of energy and developing mindfulness of ones own energy is essential to promoting health and stability ones self. Reiki is a gateway to healing and self actualization as it focuses on your chakra system and opening up the channels which energy must be able to pass through without blockage or strain. We believe that this level of healing and understanding should be open to and taught to all ages. Children are oftentimes naturally in tune with healing energy, and the earlier one can grasp these concepts, the better. Our methods of reiki are focused on cleansing, healing, increasing intuition, and knowledge of self.",
        ],
      },
      {
        heading: "Workshops & learning",
        paragraphs: [
          "Short form gatherings cover embodied practices and education without hype or pressure. Dates and enrollment will be announced soon.",
        ],
      },
    ],
  },
  retreat: {
    title: "Retreat",
    photos: [
      {
        src: "/images/retreat/retreat-hiking-couple.png",
        alt: "A smiling man and woman on a hiking trail overlooking lush green mountains and a lake in Dominica",
      },
      {
        src: "/images/retreat/retreat-01.png",
        alt: "Aerial view of Scotts Head peninsula with turquoise bays and coral shallows in Dominica",
      },
      {
        src: "/images/retreat/retreat-02.png",
        alt: "Mountain lake surrounded by lush rainforest in Dominica",
      },
      {
        src: "/images/retreat/retreat-03.png",
        alt: "Calm tropical lagoon with palm trees and black sand shore in Dominica",
      },
      {
        src: "/images/retreat/retreat-04.png",
        alt: "Sunny beach at the base of a green mountain in Dominica",
      },
      {
        src: "/images/retreat/retreat-05.png",
        alt: "Retreat guests hiking a scenic trail through tropical hills in Dominica",
      },
      {
        src: "/images/retreat/retreat-06.png",
        alt: "Steep jungle hiking path with a handrail through dense greenery in Dominica",
      },
      {
        src: "/images/retreat/retreat-07.png",
        alt: "Fresh tropical fruits arranged on a wooden table in Dominica",
      },
      {
        src: "/images/retreat/retreat-08.png",
        alt: "Winding road through lush tropical hills in Dominica",
      },
      {
        src: "/images/retreat/retreat-09.png",
        alt: "Waterfall flowing into a clear pool in the Dominica rainforest",
      },
      {
        src: "/images/retreat/retreat-10.png",
        alt: "Colorful boat on a river surrounded by palm trees in Dominica",
      },
      {
        src: "/images/retreat/retreat-11.png",
        alt: "Twin waterfalls of Trafalgar Falls with lush cliffs in Dominica",
      },
    ] satisfies readonly NaturePhoto[],
    themedRetreatsIntro:
      "Themed retreats on Dominica, the Nature Island of the Caribbean. Most retreats run 1 week; the fitness retreat is offered in 2 week or 1 month formats. Eight spots per scheduled retreat; personalized custom healing retreats for groups of 4 to 8 year round. Every retreat is all inclusive.",
    allInclusive: {
      heading: "All inclusive retreats",
      paragraphs: [
        "Every Iron Lion retreat is all inclusive. Your $2,500 retreat fee covers lodging, plant based meals, healing sessions, workshops, and on island experiences, everything you need once you arrive.",
        "The only additional cost is your flight to Dominica. Book your retreat, arrange travel, and we take care of the rest.",
      ],
    },
    booking: {
      title: "Book the retreat",
      intro:
        "Choose your all inclusive retreat, then register your group (4 to 8 participants). Each person pays a $500 deposit toward the $2,500 retreat fee, then the remaining $2,000 balance is due 2 to 4 weeks after the deposit (pay in full or installments on Stripe when eligible). Flights are not included.",
      pageTitle: "Retreat group registration",
      pageIntro:
        "Select your themed retreat, then enter every participant’s contact details, age, dietary needs, and fitness or mobility level. Each person will use this page to pay their own $500 deposit, then their remaining balance when the payment window opens. Retreats are all inclusive, only your flight is booked separately.",
      retreatTypeLegend: "Choose your retreat",
      retreatTypeLead:
        "Select the themed retreat your group is registering for. All options are all inclusive, flight is the only cost beyond your retreat fee. Most retreats are 1 week ($2,500). The private couples therapy / bonding retreat is for 2 people ($5,000 per person). The group couples bonding retreat welcomes 4 to 8 participants ($2,500 per person). The personalized retreat uses custom dates. The fitness retreat is 2 weeks ($3,000) or 1 month ($5,000).",
      durationLegend: "Choose your length",
      durationLead: "Select 2 weeks or 1 month for this retreat. A $500 deposit applies either way; the remaining balance is due 2 to 4 weeks after deposit.",
      types: [
        {
          slug: "couples-bonding-healing",
          label: "Couples Therapy / Bonding Retreat",
          summary:
            "Private two-person experience for partners: shared healing, movement, and reflection to strengthen connection and trust.",
          duration: "Private · 2 participants",
          totalCents: 500_000,
          minParticipants: 2,
          maxParticipants: 2,
        },
        {
          slug: "group-couples-bonding",
          label: "Group Couples Bonding Retreat",
          summary:
            "A shared bonding experience for couples in community: healing practices, movement, and reflection with 4 to 8 participants.",
          duration: "1 week · 4 to 8 participants",
          totalCents: 250_000,
          minParticipants: 4,
          maxParticipants: 8,
        },
        {
          slug: "divine-masculine-brotherhood",
          label: "Divine Masculine Brotherhood Retreat",
          summary: "Brotherhood, embodiment, and holistic healing in community.",
          duration: "1 week",
        },
        {
          slug: "divine-feminine-sisterhood",
          label: "Divine Feminine Sisterhood Retreat",
          summary: "Sisterhood, restoration, and spiritual wellness among women.",
          duration: "1 week",
        },
        {
          slug: "holistic-fitness-vitality-weight-loss",
          label: "Holistic Fitness, Vitality, and Weight Loss Retreat",
          summary: "Movement, plant based nourishment, and vitality practices.",
          durationOptions: [
            { slug: "2-weeks", label: "2 weeks", totalCents: 300_000 },
            { slug: "1-month", label: "1 month", totalCents: 500_000 },
          ],
        },
        {
          slug: "cannabis-healing-nature",
          label: "Cannabis Healing, Education & Nature Retreat",
          summary:
            "Healing focused education on mindful cannabis use for mind, body, and spirit, with nature immersion on Dominica.",
          duration: "1 week",
        },
        {
          slug: "personalized-custom-healing",
          label: "Personalized Custom Healing Retreat",
          summary: "Tailored itinerary for your group, available year round.",
          duration: "Custom dates · groups of 4 to 8",
        },
      ],
      ageLabel: "Age",
      dietaryLabel: "Dietary restrictions & allergies",
      dietaryPlaceholder: "List restrictions, allergies, or sensitivities (write “None” if applicable)",
      mobilityLabel: "Fitness / mobility level",
      mobilityLevels: [
        { value: "high", label: "High, comfortable with strenuous activity" },
        { value: "moderate", label: "Moderate, regular movement, some limits" },
        { value: "limited", label: "Limited, need modifications and a slower pace" },
        { value: "minimal", label: "Minimal, significant mobility support needed" },
      ] as const,
      hubTitle: "Retreat payments",
      hubIntro:
        "Share this page with your group. Each participant signs in with their registered email to pay their deposit and balance.",
      minParticipants: 4,
      maxParticipants: 8,
      totalCents: 250_000,
      depositCents: 50_000,
      balanceCents: 200_000,
      balanceDueMinWeeks: 2,
      balanceDueMaxWeeks: 4,
      marketingConsentLabel:
        "I agree to receive emails and texts from Iron Lion about this retreat and related wellness updates. I can unsubscribe anytime.",
    },
    sections: [
      {
        paragraphs: [
          "At our holistic healing retreat in Dominica, WI, immerse yourself in a serene oasis of wellness and rejuvenation. Nestled amidst lush tropical landscapes and crystal clear waters, our retreat offers a sanctuary for healing and self discovery. Engage in transformative practices such as Reiki, deep breath work, and fitness to harmonize your mind, body, and spirit. Indulge in nourishing 100% plant based meals made with locally sourced ingredients that cater to your holistic well being. Experience the healing power of nature as you explore the island's natural beauty and immerse yourself in its revitalizing energy. Leave feeling refreshed and empowered to continue your path towards holistic wellness.",
        ],
      },
      {
        heading: "All inclusive pricing",
        paragraphs: [
          "$2,500 per participant for 1 week retreats, all inclusive (lodging, meals, sessions, and on island experiences). The private Couples Therapy / Bonding Retreat is for 2 people at $5,000 per person. The Group Couples Bonding Retreat is $2,500 per person for groups of 4 to 8. The Holistic Fitness retreat is $3,000 for 2 weeks or $5,000 for 1 month. You only purchase your flight separately.",
          "$500 non refundable deposit due at registration; remaining balance due in full between 2 and 4 weeks after your deposit (installment options available at checkout when eligible). Most group retreats need 4 to 8 participants; the private couples retreat is exactly 2 participants. Each person lists age, dietary restrictions and allergies, and fitness or mobility level at registration so we can plan meals and movement safely.",
        ],
      },
    ],
  },
  shop: {
    title: "Shop plant medicine",
    intro:
      "Curated botanicals and sea moss from our apothecary. Add items to your cart, then checkout with card payment or installments (when eligible). Prices exclude sales tax.",
    checkoutTitle: "Checkout",
    checkoutIntro:
      "Review your cart, register, and pay securely with Stripe. Choose pay in full or installments at checkout when available.",
    checkoutRegistrationTitle: "Your details",
    checkoutRegistrationIntro:
      "Please register so we can confirm your order and stay in touch about pickup, shipping, and future offerings.",
    disclaimer:
      "These offerings are for education and wellness support only and are not medical advice. Ask your care team before use if you are pregnant, nursing, or managing a health condition.",
  },
  legal: {
    privacySummary:
      "This placeholder page will be replaced with counsel reviewed language describing what data this site collects (if any), analytics, and third parties.",
    termsSummary:
      "This placeholder page will be replaced with terms of use for the website and any future commerce or booking features.",
  },
} as const;

export const services: Service[] = [
  {
    slug: "reiki-sessions",
    title: "Reiki sessions",
    summary:
      "Focused on grounding, integration, and consent led practice.",
    sections: [
      {
        paragraphs: [
          "Sessions are paced slowly, with check ins before and after. You remain in charge of touch, silence, and breaks.",
        ],
      },
      {
        heading: "Booking note",
        paragraphs: [
          "Book through Healing Services & Classes: register, pay securely, then schedule your session on Calendly with your chosen practitioner.",
        ],
      },
    ],
  },
  {
    slug: "education-workshops",
    title: "Education & workshops",
    summary:
      "Short form learning on Reiki basics, plant forward living, and embodied practices, without dogma.",
    sections: [
      {
        paragraphs: [
          "Workshops emphasize accessibility and respect for diverse belief systems. Content is informational and experiential, not prescriptive medical advice.",
        ],
      },
    ],
  },
];

export const shopProducts: ShopProduct[] = [
  {
    slug: "bottled-teas",
    name: "Bottled Teas",
    priceCents: 500,
    imageSrc: "/images/shop/bottled-teas.jpg",
    imageAlt: "Bottled herbal teas from Iron Lion apothecary",
  },
  {
    slug: "guava-leaves",
    name: "Guava Leaves",
    priceCents: 2000,
    imageSrc: "/images/shop/guava-leaves.webp",
    imageAlt: "Dried guava leaves",
  },
  {
    slug: "cinnamon-leaves",
    name: "Cinnamon leaves",
    priceCents: 2000,
    imageSrc: "/images/shop/cinnamon-leaves.png",
    imageAlt: "Cinnamon leaves",
  },
  {
    slug: "nettle",
    name: "Nettle",
    priceCents: 2000,
    imageSrc: "/images/shop/nettle.jpeg",
    imageAlt: "Dried nettle",
  },
  {
    slug: "avocado-leaves",
    name: "Avocado leaves",
    priceCents: 2000,
    imageSrc: "/images/shop/avocado-leaves.jpg",
    imageAlt: "Avocado leaves",
  },
  {
    slug: "cerasee",
    name: "Cerasee",
    priceCents: 2000,
    imageSrc: "/images/shop/cerasee.png",
    imageAlt: "Cerasee herb",
  },
  {
    slug: "blue-vervain",
    name: "Blue Vervain",
    priceCents: 2000,
    imageSrc: "/images/shop/blue-vervain.jpg",
    imageAlt: "Blue vervain",
  },
  {
    slug: "soursop-leaves",
    name: "Soursop Leaves",
    priceCents: 2000,
    imageSrc: "/images/shop/soursop-leaves.jpg",
    imageAlt: "Soursop leaves",
  },
  {
    slug: "dried-sea-moss",
    name: "Dried Sea moss",
    priceCents: 1000,
    imageSrc: "/images/shop/dried-sea-moss.jpg",
    imageAlt: "Dried sea moss",
  },
  {
    slug: "sea-moss-gel",
    name: "Sea moss Gel",
    priceCents: 1200,
    imageSrc: "/images/shop/sea-moss-gel.png",
    imageAlt: "Sea moss gel",
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getServiceSlugs(): { slug: string }[] {
  return services.map((s) => ({ slug: s.slug }));
}

/** True when `site.calendly.url` is a real Calendly link (not empty / placeholder). */
export function isCalendlyConfigured(): boolean {
  const url = site.calendly.url.trim();
  return url.length > 0 && /^https:\/\/calendly\.com\/.+/i.test(url);
}

export function healingServiceHref(item: HealingServiceItem): string {
  if (item.kind === "shop") return "/shop";
  if (item.kind === "classes") return "/healing-services/classes";
  const next = item.kind === "donation" ? "donation" : "book";
  const params = new URLSearchParams({ next, service: item.slug });
  return `/register?${params.toString()}`;
}

export function getBookableService(slug: string): BookableService | undefined {
  const classSlug = slug.startsWith("class-") ? slug.slice("class-".length) : undefined;
  if (classSlug) {
    const offering = site.healingServices.classCatalog.classes.find((c) => c.slug === classSlug);
    if (!offering) return undefined;
    return {
      slug,
      label: offering.title,
      kind: "book",
      priceCents: offering.priceCents,
    };
  }

  const item = site.healingServices.services.find((s) => s.slug === slug && s.kind === "book");
  if (!item) return undefined;

  if (item.slidingScale) {
    return {
      ...item,
      priceCents: item.slidingScale.defaultCents,
      slidingScale: item.slidingScale,
    };
  }

  if (typeof item.priceCents !== "number") return undefined;
  return item as BookableService;
}
