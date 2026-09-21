import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Entrepreneur, Article, Project } from '../types';
import { FAFEEvent } from '../types';
import { ActionCategory, FAFEAction, ActionTestimonial, ActionStatistic } from '../types';
import { DEMO_PROJECTS, DEMO_ARTICLES, DEMO_EVENTS } from './mockData';

export async function fetchEntrepreneurs(limitCount?: number, featuredOnly = false): Promise<Entrepreneur[]> {
  try {
    const conditions = [where('status', '==', 'APPROVED')];
    if (featuredOnly) {
      conditions.push(where('isFeatured', '==', true));
    }
    
    let entQuery = query(collection(db, 'entrepreneurs'), ...conditions);
    if (limitCount) {
      entQuery = query(entQuery, limit(limitCount));
    }
    const snap = await getDocs(entQuery);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Entrepreneur));
  } catch (error: any) {
    console.warn("Notice fetching entrepreneurs (using fallback defaults):", error?.message || error);
    return [];
  }
}

export async function fetchProjects(limitCount?: number): Promise<Project[]> {
  try {
    let projQuery = query(collection(db, 'projects'), where('status', '==', 'ACTIVE'));
    if (limitCount) {
      projQuery = query(projQuery, limit(limitCount));
    }
    const snap = await getDocs(projQuery);
    const firestoreProjects = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    if (firestoreProjects.length > 0) {
      return firestoreProjects;
    }
    return limitCount ? DEMO_PROJECTS.slice(0, limitCount) : DEMO_PROJECTS;
  } catch (error: any) {
    console.warn("Notice fetching projects (using fallback defaults):", error?.message || error);
    return limitCount ? DEMO_PROJECTS.slice(0, limitCount) : DEMO_PROJECTS;
  }
}

export async function fetchArticles(limitCount?: number): Promise<Article[]> {
  try {
    let artQuery = query(
      collection(db, 'articles'),
      where('status', '==', 'PUBLISHED'),
      orderBy('publishedAt', 'desc')
    );
    if (limitCount) {
      artQuery = query(artQuery, limit(limitCount));
    }
    const snap = await getDocs(artQuery);
    const firestoreArticles = snap.docs.map(d => ({ id: d.id, ...d.data() } as Article));
    if (firestoreArticles.length > 0) {
      return firestoreArticles;
    }
    return limitCount ? DEMO_ARTICLES.slice(0, limitCount) : DEMO_ARTICLES;
  } catch (error: any) {
    console.warn("Notice fetching articles (using fallback defaults):", error?.message || error);
    return limitCount ? DEMO_ARTICLES.slice(0, limitCount) : DEMO_ARTICLES;
  }
}

export async function fetchEvents(limitCount?: number): Promise<FAFEEvent[]> {
  try {
    let evtQuery = query(
      collection(db, 'events'),
      where('status', 'in', ['PUBLISHED', 'REGISTRATION_OPEN', 'ONGOING']),
      orderBy('startDate', 'asc')
    );
    if (limitCount) {
      evtQuery = query(evtQuery, limit(limitCount));
    }
    const snap = await getDocs(evtQuery);
    const firestoreEvents = snap.docs.map(d => ({ id: d.id, ...d.data() } as FAFEEvent));
    if (firestoreEvents.length > 0) {
      return firestoreEvents;
    }
    return (limitCount ? DEMO_EVENTS.slice(0, limitCount) : DEMO_EVENTS) as unknown as FAFEEvent[];
  } catch (error: any) {
    console.warn("Notice fetching events (using fallback defaults):", error?.message || error);
    return (limitCount ? DEMO_EVENTS.slice(0, limitCount) : DEMO_EVENTS) as unknown as FAFEEvent[];
  }
}

// Note: These action functions were previously entirely mocked. 
// We are keeping them empty for now since there's no Firestore schema defined for them yet in this file.
export async function fetchActionCategories(): Promise<ActionCategory[]> {
  return [];
}

export async function fetchFAFEActions(limitCount?: number, featuredOnly = false): Promise<FAFEAction[]> {
  return [];
}

export async function fetchActionStats(): Promise<ActionStatistic[]> {
  return [];
}

export async function fetchActionTestimonials(): Promise<ActionTestimonial[]> {
  return [];
}
