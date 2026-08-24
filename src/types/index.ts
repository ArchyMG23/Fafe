export type Role = 'MEMBER' | 'ADMIN' | 'ENTREPRENEUR' | 'MODERATOR' | 'TRAINER' | 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'FINANCE_MANAGER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  company?: string;
  position?: string;
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
  userId?: string; 
  ownerId?: string;
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

// ---------------------------------------------------------
// NEW DONATION SYSTEM TYPES
// ---------------------------------------------------------

export type PaymentStatus = 'NOT_REQUIRED' | 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';
export type DonationStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'FAILED' | 'EXPIRED';

export type DonationFrequency = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface Donation {
  id: string;
  donorUserId?: string; // Optional if guest
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorPhone?: string;
  donorCountry?: string;
  organisation?: string;
  anonymous: boolean;
  amount: number;
  currency: 'XAF' | 'EUR' | 'USD' | 'GBP';
  frequency: DonationFrequency;

  projectId: string; // 'GENERAL' for FAFE - Fonds général
  paymentProvider?: string; // e.g., 'MTN', 'STRIPE', 'ORANGE', 'WAVE'
  paymentMethod?: string; // e.g., 'MOBILE_MONEY', 'CARD'
  paymentStatus: PaymentStatus;
  donationStatus: DonationStatus;
  transactionReference?: string;
  providerReference?: string;
  receiptNumber?: string;
  subscriptionId?: string;
  nextPaymentDate?: number;
  subscriptionStatus?: SubscriptionStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  country: string;
  image: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  donationEnabled: boolean;
  objectives?: string[];
  impact?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  resourceType: string; // 'DONATION', 'PROJECT', etc.
  resourceId: string;
  timestamp: number;
  metadata?: any;
}

export interface CountryStat {
  id: string;
  code: string;
  name: string;
  activeEntrepreneursCount: number;
}

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

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED'
}

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
  ATTENDED = 'ATTENDED',
  NO_SHOW = 'NO_SHOW'
}

export interface FAFEEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  eventType: string;
  coverImage: string;
  startDate: number;
  endDate: number;
  timezone: string;
  country: string;
  city: string;
  venue: string;
  online: boolean;
  meetingUrl?: string;
  registrationRequired: boolean;
  registrationOpen: boolean;
  registrationDeadline?: number;
  capacity?: number;
  price?: number;
  currency?: string;
  status: EventStatus;
  organizer: string;
  createdAt: number;
  updatedAt: number;
  waitlistEnabled?: boolean;
  certificateEnabled?: boolean;
  certificateEligibility?: 'REGISTERED' | 'ATTENDED';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  company?: string;
  position?: string;
  specialRequirements?: string;
  registrationReference: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  createdAt: number;
  updatedAt: number;
  attended?: boolean;
  checkedInAt?: number;
  checkedInBy?: string;
}

export interface Certificate {
  certificateId: string;
  participantName: string;
  eventName: string;
  eventDate: number;
  eventType: string;
  registrationReference: string;
  issuedAt: number;
  issuer: string;
  verificationToken: string;
}

// ---------------------------------------------------------
// NEW MEMBERSHIP SYSTEM TYPES
// ---------------------------------------------------------

export type MembershipStatus = 'PENDING' | 'AWAITING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'UNDER_REVIEW' | 'ACTIVE' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface Membership {
  id: string;
  userId: string;
  membershipNumber?: string;
  status: MembershipStatus;
  membershipType: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  bankReference?: string;
  proofUrl?: string;
  submittedAt?: number;
  verifiedAt?: number;
  verifiedBy?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

// ---------------------------------------------------------
// CMS TYPES
// ---------------------------------------------------------

export interface LocalizedString {
  fr: string;
  en: string;
}

export interface CMSHeroSlide {
  id: string;
  image: string;
  title: LocalizedString;
  shortText: LocalizedString;
  buttonText: LocalizedString;
  link: string;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CMSBankDetails {
  bankName: string;
  accountNumber: string;
  iban: string;
  swift: string;
}
