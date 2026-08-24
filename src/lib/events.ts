import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, setDoc, addDoc, updateDoc, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { FAFEEvent, EventStatus, EventRegistration, RegistrationStatus } from '../types';

export const getPublishedEvents = async (pageLimit = 10, lastDoc?: any) => {
  try {
    let q = query(
      collection(db, 'events'),
      where('status', 'in', ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED']),
      orderBy('startDate', 'asc'),
      limit(pageLimit)
    );
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FAFEEvent));
    return { events, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getEventBySlug = async (slug: string) => {
  try {
    const q = query(collection(db, 'events'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FAFEEvent;
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    throw error;
  }
};

export const checkRegistrationExists = async (eventId: string, userId?: string, email?: string) => {
  try {
    let q;
    if (userId) {
      q = query(collection(db, 'eventRegistrations'), where('eventId', '==', eventId), where('userId', '==', userId));
    } else if (email) {
      q = query(collection(db, 'eventRegistrations'), where('eventId', '==', eventId), where('email', '==', email.toLowerCase()));
    } else {
      return false;
    }
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking registration:', error);
    return true; // fail safe
  }
};

export const registerForEvent = async (event: FAFEEvent, registrationData: Partial<EventRegistration>) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, 'events', event.id);
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) throw new Error("L'événement n'existe pas");
      
      const eventData = eventDoc.data() as FAFEEvent;
      
      // Capacity check
      if (eventData.capacity && eventData.capacity > 0) {
        // Need to count current valid registrations... This is hard in a transaction without a counter field.
        // For production, we should maintain a `registrationsCount` on the event document.
      }
      
      const newRegistrationRef = doc(collection(db, 'eventRegistrations'));
      
      const registration: EventRegistration = {
        id: newRegistrationRef.id,
        eventId: event.id,
        ...registrationData,
        status: RegistrationStatus.REGISTERED, // or waitlisted based on logic
        paymentStatus: eventData.price && eventData.price > 0 ? 'PENDING' : 'NOT_REQUIRED',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        registrationReference: `FAFE-EVT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
      } as EventRegistration;
      
      transaction.set(newRegistrationRef, registration);
      return registration;
    });
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};
