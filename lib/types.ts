export type PublicationStatus = "published" | "draft" | "archived";

export interface Guide {
  id: string;
  slug: string;
  sourceRelativePath: string;
  destinationRelativePath: string;
  pdfUrl: string;
  originalFilename: string;
  displayTitle: string;
  shortTitle?: string;
  topLevelFolder: string;
  folderHierarchy: string[];
  category: string;
  collection: string;
  topic: string;
  volume?: number;
  volumeLabel?: string;
  seriesOrder: number;
  description: string;
  synopsis?: string;
  learningOutcomes?: string[];
  tags: string[];
  authors: string[];
  publicationStatus: PublicationStatus;
  featured: boolean;
  boardRelevant: boolean;
  publishedDate?: string;
  lastReviewedDate?: string;
  fileModifiedDate: string;
  synchronizedDate: string;
  fileSize: number;
  pageCount?: number;
  coverUrl?: string;
  fileHash: string;
  relatedGuideIds: string[];
  prerequisites: string[];
  privacyWarnings: string[];
  orphaned: boolean;
}

export interface GuideManifest {
  _generatedComment: string;
  schemaVersion: 1;
  generatedAt: string;
  sourceLabel: "Study Guides";
  guides: Guide[];
}

export type GuideOverride = Partial<
  Pick<
    Guide,
    | "displayTitle"
    | "shortTitle"
    | "description"
    | "synopsis"
    | "learningOutcomes"
    | "category"
    | "collection"
    | "topic"
    | "tags"
    | "authors"
    | "volume"
    | "featured"
    | "publicationStatus"
    | "publishedDate"
    | "lastReviewedDate"
    | "boardRelevant"
    | "relatedGuideIds"
    | "prerequisites"
    | "slug"
  >
> & { order?: number };

export type GuideOverrides = Record<string, GuideOverride>;
