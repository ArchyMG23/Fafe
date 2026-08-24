import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Membership, MembershipStatus } from '../types';

export const createMembershipRequest = async (userId: string, data: Partial<Membership>) => {
  const membershipRef = doc(collection(db, 'memberships'));
  const membership: Membership = {
    id: membershipRef.id,
    userId,
    status: 'PENDING',
    membershipType: data.membershipType || 'STANDARD',
    amount: data.amount || 50000,
    currency: data.currency || 'XAF',
    paymentMethod: 'BANK_TRANSFER',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await setDoc(membershipRef, membership);
  return membership;
};

export const getUserMemberships = async (userId: string) => {
  const q = query(collection(db, 'memberships'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Membership);
};

export const submitMembershipPayment = async (membershipId: string, bankReference: string, proofUrl?: string) => {
  const membershipRef = doc(db, 'memberships', membershipId);
  await updateDoc(membershipRef, {
    status: 'PAYMENT_SUBMITTED',
    bankReference,
    proofUrl,
    submittedAt: Date.now(),
    updatedAt: Date.now()
  });
};
