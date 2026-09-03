import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Entrepreneur, Article, Project } from '../types';
import { FAFEEvent } from '../types';
import { ActionCategory, FAFEAction, ActionTestimonial, ActionStatistic } from '../types';

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
  } catch (error) {
    console.error("Error fetching entrepreneurs:", error);
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
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
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
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Article));
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
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
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FAFEEvent));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
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
