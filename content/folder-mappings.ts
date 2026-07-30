export const folderMappings = {
  categories: {
    "Head and Neck": "Head and Neck Oncology",
    Otology: "Otology and Neurotology",
  },
  collections: {
    "Free Flaps": "Free-Flap Reconstruction",
    Vestibular: "Vestibular System",
    "Salivary Gland Neoplasms": "Salivary Gland Neoplasms",
    "Face Trauma": "Facial Trauma",
  },
} satisfies {
  categories: Record<string, string>;
  collections: Record<string, string>;
};
