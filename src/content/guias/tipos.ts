export type GuideBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'dont'; items: string[] }
  | { type: 'callout'; text: string };

export type GuideSection = {
  heading: string;
  blocks: GuideBlock[];
};

export type GuideAuthor = {
  name: string;
  credentials: string;
  org?: string;
  orgUrl?: string;
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  emoji: string;
  readingMinutes: number;
  /** `null` si la redactó el equipo de CaliSolidario. */
  author: GuideAuthor | null;
  sections: GuideSection[];
  sources: { label: string; url?: string }[];
};
