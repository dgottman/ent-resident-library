export const siteConfig = {
  name: "ENT Resident Library",
  shortName: "ENT Library",
  description:
    "Resident-level guides for understanding otolaryngology from first principles.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: "ENT Resident Library",
  navigation: [
    { label: "Home", href: "/" },
    { label: "Study Guides", href: "/guides" },
    { label: "Topics", href: "/topics" },
    { label: "Recently Updated", href: "/recently-updated" },
    { label: "About", href: "/about" },
  ],
  categories: [
    "Otology and Neurotology",
    "Rhinology and Skull Base",
    "Head and Neck Oncology",
    "Laryngology",
    "Pediatric Otolaryngology",
    "Facial Plastic and Reconstructive Surgery",
    "Sleep Medicine",
    "General Otolaryngology",
    "Trauma and Emergency ENT",
    "Anatomy and Physiology",
  ],
  educationalDisclaimer:
    "Educational material only. It does not replace clinical judgment, local protocols, attending guidance, or review of primary literature and authoritative references. Never include patient-identifying information.",
} as const;

export type SiteCategory = (typeof siteConfig.categories)[number] | string;
