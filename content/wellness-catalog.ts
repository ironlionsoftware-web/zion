/**
 * Curated offerings for the wellness guide matcher.
 * Tags and phrases are used for search, not medical claims.
 */

export type WellnessOfferingKind = "healing-service" | "fitness" | "shop-product" | "retreat";

export type WellnessOffering = {
  id: string;
  kind: WellnessOfferingKind;
  title: string;
  summary: string;
  href: string;
  /** Weighted search terms (conditions, goals, feelings, synonyms). */
  tags: string[];
};

export const wellnessDisclaimer =
  "Suggestions are educational starting points only, not medical advice, diagnosis, or treatment. Always consult licensed care providers for health conditions. Plant offerings and ceremonies have their own preparation and safety requirements; we will discuss those before you book.";

export const wellnessGuidePrompts = [
  "stress and trouble sleeping",
  "low energy and wanting more minerals",
  "spiritual clarity and life direction",
  "grief and emotional heaviness",
  "blood sugar support with herbs",
  "deep reset in nature with a group",
] as const;

export const wellnessCatalog: WellnessOffering[] = [
  {
    id: "reiki",
    kind: "healing-service",
    title: "Reiki & Frequency tuning",
    summary:
      "Gentle energy work and frequency tuning focused on grounding, chakra balance, nervous system ease, and consent led sessions.",
    href: "/register?next=book&service=reiki",
    tags: [
      "reiki",
      "energy",
      "chakra",
      "anxiety",
      "stress",
      "grief",
      "trauma",
      "burnout",
      "overwhelmed",
      "spiritual",
      "balance",
      "grounding",
      "rest",
      "emotional",
      "nervous system",
      "calm",
      "healing touch",
      "intuition",
      "frequency",
      "sound",
      "vibration",
      "tuning",
      "somatic",
    ],
  },
  {
    id: "consultation",
    kind: "healing-service",
    title: "Consultation",
    summary:
      "Schedule a consultation to map a holistic health plan for mind, body, and spirit, with structure, root cause focus, and next steps that fit your life.",
    href: "/register?next=book&service=consultation",
    tags: [
      "consultation",
      "consult",
      "intake",
      "holistic plan",
      "health plan",
      "mind body spirit",
      "root cause",
      "assessment",
      "first visit",
      "getting started",
      "direction",
      "goals",
    ],
  },
  {
    id: "help-sessions",
    kind: "healing-service",
    title: "H.e.l.p. sessions",
    summary:
      "Channelled insight and spiritual or mental coaching for clarity, direction, and inner work, complementary to licensed therapy.",
    href: "/register?next=book&service=help-sessions",
    tags: [
      "help",
      "coaching",
      "spiritual",
      "mental",
      "clarity",
      "direction",
      "purpose",
      "crossroads",
      "guidance",
      "insight",
      "life change",
      "depression support",
      "overwhelmed",
      "meaning",
      "channelled",
    ],
  },
  {
    id: "plant-medicine-ceremonies",
    kind: "healing-service",
    title: "Plant medicine ceremonies",
    summary:
      "Held, consent led ceremonial space for deep inner work and integration. Choose Hape, Sananga, Soul Flower, or Ayavine when you book.",
    href: "/register?next=book&service=plant-medicine-ceremonies",
    tags: [
      "plant medicine",
      "ceremony",
      "ceremonial",
      "deep healing",
      "integration",
      "spiritual journey",
      "inner work",
      "transformation",
      "psychedelic curious",
      "ritual",
      "ancestors",
      "breakthrough",
    ],
  },
  {
    id: "classes",
    kind: "healing-service",
    title: "Classes & workshops",
    summary:
      "Multi week and single series classes on Reiki, breath, plant forward living, and energy awareness for all ages.",
    href: "/healing-services/classes",
    tags: [
      "class",
      "classes",
      "workshop",
      "workshops",
      "learn",
      "education",
      "series",
      "group",
      "reiki class",
      "breath class",
      "kids",
      "children",
      "plant forward",
    ],
  },
  {
    id: "card-readings",
    kind: "healing-service",
    title: "Card readings",
    summary:
      "Reflective card reading for perspective when you are at a fork in the road or want intuitive reflection. Sliding scale $45 to $120.",
    href: "/register?next=book&service=card-readings",
    tags: [
      "cards",
      "tarot",
      "reading",
      "guidance",
      "intuition",
      "decision",
      "crossroads",
      "clarity",
      "reflection",
      "spiritual",
    ],
  },
  {
    id: "donation-based",
    kind: "healing-service",
    title: "Sliding scale service",
    summary:
      "Flexible contribution ($45 to $120) when cost is a barrier but you still want supported healing work.",
    href: "/register?next=donation&service=donation-based",
    tags: [
      "donation",
      "sliding scale",
      "affordable",
      "budget",
      "low cost",
      "financial",
      "accessible",
    ],
  },
  {
    id: "herbs-seamoss",
    kind: "healing-service",
    title: "Herbs & sea moss (apothecary)",
    summary:
      "Browse bottled teas, leaves, and sea moss from the shop, plant forward support for daily wellness routines.",
    href: "/shop",
    tags: [
      "herbs",
      "herbal",
      "tea",
      "seamoss",
      "sea moss",
      "botanical",
      "plant medicine daily",
      "apothecary",
      "natural",
      "holistic nutrition",
    ],
  },
  {
    id: "holistic-personal-training",
    kind: "fitness",
    title: "Holistic personal training",
    summary:
      "Strength, mobility, and conditioning paced for your joints, nervous system, and real life capacity.",
    href: "/fitness-training",
    tags: [
      "fitness",
      "training",
      "strength",
      "mobility",
      "movement",
      "weight",
      "athletic",
      "pain",
      "injury",
      "chronic pain",
      "rebuild",
      "accountability",
      "workout",
      "body",
      "conditioning",
    ],
  },
  {
    id: "retreat",
    kind: "retreat",
    title: "Dominica holistic retreat",
    summary:
      "Immersive group retreat with Reiki, breath work, plant based meals, and nature, 4 to 8 participants.",
    href: "/retreat",
    tags: [
      "retreat",
      "dominica",
      "immersive",
      "group",
      "reset",
      "vacation healing",
      "travel",
      "nature",
      "intensive",
      "week away",
      "transformation",
    ],
  },
  {
    id: "bottled-teas",
    kind: "shop-product",
    title: "Bottled teas",
    summary:
      "Small-batch herbal teas in 12 oz 6-packs ($20) or gallons ($30). Each flavor includes traditional wellness benefits—from sorrel and sea moss juice to cerasee and blue vervain.",
    href: "/shop",
    tags: ["tea", "herbal tea", "daily ritual", "hydration", "gentle", "wellness routine"],
  },
  {
    id: "guava-leaves",
    kind: "shop-product",
    title: "Guava leaves",
    summary:
      "Dried guava leaves for tea—traditionally used for digestive ease, bloating relief, and blood sugar support as a gentle daily gut tonic.",
    href: "/shop",
    tags: ["guava", "digestion", "digestive", "blood sugar", "glucose", "gut", "stomach"],
  },
  {
    id: "cinnamon-leaves",
    kind: "shop-product",
    title: "Cinnamon leaves",
    summary:
      "Dried cinnamon leaves for warm tea—traditionally used for circulation, metabolic warmth, and blood sugar awareness in plant-forward routines.",
    href: "/shop",
    tags: ["cinnamon", "circulation", "warmth", "metabolic", "blood sugar", "warming"],
  },
  {
    id: "nettle",
    kind: "shop-product",
    title: "Nettle",
    summary:
      "Mineral-rich dried nettle for steeping—used to nourish the blood, ease allergies and inflammation, and support joints and daily vitality.",
    href: "/shop",
    tags: ["nettle", "allergies", "hay fever", "inflammation", "minerals", "iron", "nourish", "joints"],
  },
  {
    id: "avocado-leaves",
    kind: "shop-product",
    title: "Avocado leaves",
    summary:
      "Dried avocado leaves for evening tea—traditionally used for calm, sleep support, and cardiovascular balance.",
    href: "/shop",
    tags: ["avocado", "sleep", "insomnia", "blood pressure", "heart", "calm", "rest"],
  },
  {
    id: "cerasee",
    kind: "shop-product",
    title: "Cerasee",
    summary:
      "Bitter cerasee leaf for cleansing tea—Caribbean tradition for blood sugar support, digestive purification, and periodic detox.",
    href: "/shop",
    tags: ["cerasee", "bitter", "cleanse", "detox", "blood sugar", "diabetes support", "purify"],
  },
  {
    id: "blue-vervain",
    kind: "shop-product",
    title: "Blue vervain",
    summary:
      "Dried blue vervain for nervine tea—often chosen for anxiety, muscle tension, and nervous system overwhelm before rest.",
    href: "/shop",
    tags: ["vervain", "anxiety", "nervous", "stress", "tension", "overwhelmed", "calm", "sleep"],
  },
  {
    id: "soursop-leaves",
    kind: "shop-product",
    title: "Soursop leaves",
    summary:
      "Dried soursop leaves for brewing—plant traditions use them for immune support, anti-inflammatory comfort, and restorative rest.",
    href: "/shop",
    tags: ["soursop", "immune", "immunity", "relaxation", "rest", "calm", "recovery"],
  },
  {
    id: "dried-sea-moss",
    kind: "shop-product",
    title: "Dried sea moss",
    summary:
      "Raw dried sea moss to prepare at home—iodine and minerals for thyroid support, iron for blood building, and prebiotic gut fibers.",
    href: "/shop",
    tags: ["sea moss", "seamoss", "minerals", "iodine", "thyroid", "energy", "gut", "nutrition", "iron"],
  },
  {
    id: "sea-moss-gel",
    kind: "shop-product",
    title: "Sea moss gel",
    summary:
      "Ready-to-use sea moss gel in 8 oz, 16 oz, or 32 oz—minerals for thyroid, digestion, joints, and steady daily energy.",
    href: "/shop",
    tags: ["sea moss gel", "seamoss", "smoothie", "minerals", "energy", "daily", "gut"],
  },
];

export function getWellnessOffering(id: string): WellnessOffering | undefined {
  return wellnessCatalog.find((o) => o.id === id);
}
