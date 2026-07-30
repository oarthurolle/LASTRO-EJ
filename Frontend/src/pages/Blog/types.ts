export interface BlogPostCard {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl: string | null;
  author: string;
  category: string | null;
  publishedAt: string;
}

export interface BlogPostDetail extends BlogPostCard {
  content: string;
  status: "PUBLISHED";
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface BlogPageResponse {
  content: BlogPostCard[];
  totalPages: number;
  totalElements: number;
  number: number;
  first: boolean;
  last: boolean;
}
