export type Role = 'MEMBER' | 'ADMIN' | 'ENTREPRENEUR' | 'MODERATOR' | 'TRAINER' | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  role: Role;
  status: UserStatus;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
}

export type EntrepreneurStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED';

export interface Entrepreneur {
  id: string;
  userId?: string; // Reference to users collection
  firstName: string;
  lastName: string;
  professionalPhoto: string;
  country: string;
  city: string;
  sector: string;
  company: string;
  position: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
  expertise: string[];
  description: string;
  productsServices: string[];
  status: EntrepreneurStatus;
  verificationStatus: VerificationStatus;
  isFeatured?: boolean;
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
  verifiedAt?: number;
  isDemo?: boolean;
}

export type ContactRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CLOSED';

export interface ContactRequest {
  id: string;
  senderId: string;
  recipientEntrepreneurId: string;
  message: string;
  status: ContactRequestStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
}

export type DonationStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type DonationFrequency = 'ONE_TIME' | 'RECURRING';

export interface Donation {
  id: string;
  userId?: string;
  donorName: string;
  donorEmail: string;
  phone?: string;
  amount: number;
  currency: string;
  frequency: DonationFrequency;
  project?: string;
  paymentMethod: string;
  status: DonationStatus;
  transactionReference?: string;
  createdAt: number;
}

export interface CountryStat {
  id: string;
  code: string;
  name: string;
  activeEntrepreneursCount: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  country: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  objectives: string[];
  impact: string;
  createdAt: number;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  categories: string[];
  tags: string[];
  publicationDate: number;
}
