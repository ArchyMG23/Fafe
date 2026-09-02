import { 
  collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, orderBy, addDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Membership, MembershipStatus, Entrepreneur, UserProfile } from '../types';

/**
 * Creates an initial membership request for an authenticated user.
 */
export const createMembershipRequest = async (userId: string, data: Partial<Membership>): Promise<Membership> => {
  const membershipRef = doc(collection(db, 'memberships'));
  const membership: Membership = {
    id: membershipRef.id,
    userId,
    status: data.status || 'AWAITING_PAYMENT',
    membershipType: data.membershipType || 'STANDARD',
    amount: data.amount || 50000,
    currency: data.currency || 'XAF',
    paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await setDoc(membershipRef, membership);
  return membership;
};

/**
 * Retrieves all membership records associated with a specific user.
 */
export const getUserMemberships = async (userId: string): Promise<Membership[]> => {
  const q = query(collection(db, 'memberships'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Membership));
};

/**
 * Submits payment proof and reference for a pending membership.
 */
export const submitMembershipPayment = async (
  membershipId: string, 
  bankReference: string, 
  proofUrl?: string,
  paymentMethod: string = 'BANK_TRANSFER'
) => {
  const membershipRef = doc(db, 'memberships', membershipId);
  await updateDoc(membershipRef, {
    status: 'PAYMENT_SUBMITTED',
    bankReference,
    proofUrl: proofUrl || '',
    paymentMethod,
    submittedAt: Date.now(),
    updatedAt: Date.now()
  });
};

/**
 * Generates an official unique FAFE membership number.
 * Format: FAFE-YYYY-XXXXXX
 */
export const generateMembershipNumber = (): string => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `FAFE-${year}-${randomSuffix}`;
};

/**
 * Admin approves a membership.
 * Automates:
 * 1. Membership status -> ACTIVE with generated membershipNumber & audit trail.
 * 2. User record membershipStatus -> ACTIVE & membershipNumber.
 * 3. Automatic directory profile sync: Activates/creates Entrepreneur record in 'entrepreneurs' collection with status 'APPROVED' and 'VERIFIED'.
 */
export const approveMembership = async (
  membershipId: string, 
  userId: string, 
  adminId?: string
): Promise<{ membershipNumber: string }> => {
  // 1. Generate or retrieve existing membership number
  const membershipRef = doc(db, 'memberships', membershipId);
  const memSnap = await getDoc(membershipRef);
  const existingMem = memSnap.exists() ? (memSnap.data() as Membership) : null;
  const membershipNumber = existingMem?.membershipNumber || generateMembershipNumber();

  const now = Date.now();

  // 2. Update membership document
  await updateDoc(membershipRef, {
    status: 'ACTIVE' as MembershipStatus,
    membershipNumber,
    verifiedAt: now,
    verifiedBy: adminId || 'admin',
    updatedAt: now
  });

  // 3. Update user document
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? (userSnap.data() as UserProfile) : null;

  await updateDoc(userRef, {
    membershipStatus: 'ACTIVE' as MembershipStatus,
    membershipNumber,
    updatedAt: now
  });

  // 4. Automatic Idempotent Directory Activation
  const entQuery = query(collection(db, 'entrepreneurs'), where('ownerId', '==', userId));
  const entSnapshot = await getDocs(entQuery);

  if (!entSnapshot.empty) {
    // Update existing entrepreneur directory entry to APPROVED & VERIFIED
    for (const d of entSnapshot.docs) {
      await updateDoc(doc(db, 'entrepreneurs', d.id), {
        status: 'APPROVED',
        verificationStatus: 'VERIFIED',
        membershipNumber,
        approvedAt: now,
        verifiedAt: now,
        updatedAt: now
      });
    }
  } else if (userData) {
    // Automatically create a new directory entry from the user profile so they appear immediately in the Annuaire
    const newEntrepreneur: Partial<Entrepreneur> = {
      ownerId: userId,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      company: userData.company || `${userData.firstName} ${userData.lastName} Enterprise`,
      position: userData.position || 'Entrepreneure Membre FAFE',
      country: userData.country || 'Afrique',
      city: userData.city || '',
      sector: userData.sector || 'Autre',
      description: userData.bio || `Membre active et officielle du réseau FAFE (${userData.firstName} ${userData.lastName}).`,
      expertise: userData.expertise ? [userData.expertise] : ['Entrepreneuriat', 'Leadership'],
      productsServices: [],
      professionalPhoto: userData.photoURL || '',
      socialLinks: userData.socialLinks || {},
      status: 'APPROVED',
      verificationStatus: 'VERIFIED',
      membershipNumber,
      approvedAt: now,
      verifiedAt: now,
      createdAt: now,
      updatedAt: now
    };

    await addDoc(collection(db, 'entrepreneurs'), newEntrepreneur);
  }

  return { membershipNumber };
};

/**
 * Admin rejects a membership.
 * Deactivates directory visibility if previously active.
 */
export const rejectMembership = async (
  membershipId: string, 
  userId: string, 
  adminId?: string, 
  reason?: string
) => {
  const now = Date.now();
  
  // 1. Update membership document
  await updateDoc(doc(db, 'memberships', membershipId), {
    status: 'REJECTED' as MembershipStatus,
    rejectionReason: reason || 'Demande non conforme ou justificatif invalide',
    verifiedAt: now,
    verifiedBy: adminId || 'admin',
    updatedAt: now
  });

  // 2. Update user profile
  await updateDoc(doc(db, 'users', userId), {
    membershipStatus: 'REJECTED' as MembershipStatus,
    updatedAt: now
  });

  // 3. Suspend/Reject corresponding directory entry
  const entQuery = query(collection(db, 'entrepreneurs'), where('ownerId', '==', userId));
  const entSnapshot = await getDocs(entQuery);
  for (const d of entSnapshot.docs) {
    await updateDoc(doc(db, 'entrepreneurs', d.id), {
      status: 'REJECTED',
      updatedAt: now
    });
  }
};

/**
 * Admin suspends an active membership.
 * Automatically removes visibility from public directory.
 */
export const suspendMembership = async (
  membershipId: string, 
  userId: string, 
  adminId?: string, 
  reason?: string
) => {
  const now = Date.now();
  
  await updateDoc(doc(db, 'memberships', membershipId), {
    status: 'SUSPENDED' as MembershipStatus,
    rejectionReason: reason || 'Adhésion suspendue par l\'administration',
    updatedAt: now
  });

  await updateDoc(doc(db, 'users', userId), {
    membershipStatus: 'SUSPENDED' as MembershipStatus,
    updatedAt: now
  });

  const entQuery = query(collection(db, 'entrepreneurs'), where('ownerId', '==', userId));
  const entSnapshot = await getDocs(entQuery);
  for (const d of entSnapshot.docs) {
    await updateDoc(doc(db, 'entrepreneurs', d.id), {
      status: 'SUSPENDED',
      updatedAt: now
    });
  }
};

/**
 * Admin reactivates a suspended or expired membership.
 */
export const reactivateMembership = async (
  membershipId: string, 
  userId: string, 
  adminId?: string
) => {
  const now = Date.now();
  
  await updateDoc(doc(db, 'memberships', membershipId), {
    status: 'ACTIVE' as MembershipStatus,
    updatedAt: now
  });

  await updateDoc(doc(db, 'users', userId), {
    membershipStatus: 'ACTIVE' as MembershipStatus,
    updatedAt: now
  });

  const entQuery = query(collection(db, 'entrepreneurs'), where('ownerId', '==', userId));
  const entSnapshot = await getDocs(entQuery);
  for (const d of entSnapshot.docs) {
    await updateDoc(doc(db, 'entrepreneurs', d.id), {
      status: 'APPROVED',
      updatedAt: now
    });
  }
};
