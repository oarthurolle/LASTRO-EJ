export type PublicationStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export type AdminSection =
  | "dashboard"
  | "blog"
  | "cases"
  | "partners"
  | "indicators"
  | "contacts"
  | "company"
  | "team";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  author: string;
  category: string | null;
  status: PublicationStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Partner {
  id: number;
  name: string;
  logoUrl: string;
  externalLink: string | null;
  sortOrder: number;
  active: boolean;
}

export type PartnerDraft = Omit<Partner, "id">;

export interface CaseStudy {
  id: number;
  clientName: string;
  serviceCategory: string;
  problem: string;
  solution: string;
  result: string;
  coverImageUrl: string;
  testimonial: string;
  projectDate: string;
  status: PublicationStatus;
  updatedAt: string;
}

export type BlogPostDraft = Omit<
  BlogPost,
  | "id"
  | "slug"
  | "coverImageUrl"
  | "category"
  | "publishedAt"
  | "createdAt"
  | "updatedAt"
  | "version"
> & {
  coverImageUrl: string;
  category: string;
};

export type CaseStudyDraft = Omit<CaseStudy, "id" | "updatedAt">;
