const fs = require('fs');
const path = require('path');

const typesPath = path.join(__dirname, 'src/types/index.ts');
let content = fs.readFileSync(typesPath, 'utf8');

// Append new CMS types to index.ts
const cmsTypes = `

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown
  featuredImage?: string;
  categoryId: string;
  tags: string[];
  authorId: string;
  authorName?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  articleId: string;
  userId?: string;
  name: string;
  email: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  createdAt: number;
  updatedAt: number;
}

export interface Media {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  title: string;
  description?: string;
  createdAt: number;
  authorId: string;
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  country?: string;
  eventId?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: number;
  updatedAt: number;
}
`;

content += cmsTypes;
fs.writeFileSync(typesPath, content);
console.log("CMS types added");
