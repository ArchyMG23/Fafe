import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Entrepreneur, Article, Project } from '../types';
import { DEMO_ENTREPRENEURS, DEMO_ARTICLES, DEMO_PROJECTS } from './mockData';

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
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Entrepreneur));
    
    if (results.length === 0) {
      let mock = DEMO_ENTREPRENEURS.map(e => ({ ...e, status: 'APPROVED', verificationStatus: 'VERIFIED' } as Entrepreneur));
      if (featuredOnly) mock = mock.filter(m => m.isFeatured);
      if (limitCount) mock = mock.slice(0, limitCount);
      return mock;
    }
    return results;
  } catch (error) {
    console.error("Error fetching entrepreneurs:", error);
    let mock = DEMO_ENTREPRENEURS.map(e => ({ ...e, status: 'APPROVED', verificationStatus: 'VERIFIED' } as Entrepreneur));
    if (featuredOnly) mock = mock.filter(m => m.isFeatured);
    if (limitCount) mock = mock.slice(0, limitCount);
    return mock;
  }
}

export async function fetchProjects(limitCount?: number): Promise<Project[]> {
  try {
    let projQuery = query(collection(db, 'projects'), where('status', '==', 'ACTIVE'));
    if (limitCount) {
      projQuery = query(projQuery, limit(limitCount));
    }

    const snap = await getDocs(projQuery);
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    
    if (results.length === 0) {
      let mock = [...DEMO_PROJECTS];
      if (limitCount) mock = mock.slice(0, limitCount);
      return mock;
    }
    return results;
  } catch (error) {
    console.error("Error fetching projects:", error);
    let mock = [...DEMO_PROJECTS];
    if (limitCount) mock = mock.slice(0, limitCount);
    return mock;
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
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Article));
    
    if (results.length === 0) {
      let mock = [...DEMO_ARTICLES];
      if (limitCount) mock = mock.slice(0, limitCount);
      return mock;
    }
    return results;
  } catch (error) {
    console.error("Error fetching articles:", error);
    let mock = [...DEMO_ARTICLES];
    if (limitCount) mock = mock.slice(0, limitCount);
    return mock;
  }
}

import { FAFEEvent } from '../types';
import { DEMO_EVENTS } from './mockData';

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
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as FAFEEvent));
    
    if (results.length === 0) {
      let mock = [...DEMO_EVENTS];
      if (limitCount) mock = mock.slice(0, limitCount);
      return mock as any[]; // typing might be a bit mismatched for FAFEEvent but close enough
    }
    return results;
  } catch (error) {
    console.error("Error fetching events:", error);
    let mock = [...DEMO_EVENTS];
    if (limitCount) mock = mock.slice(0, limitCount);
    return mock as any[];
  }
}

import { ActionCategory, FAFEAction, ActionTestimonial, ActionStatistic } from '../types';
import { DEMO_ACTION_CATEGORIES, DEMO_ACTIONS, DEMO_ACTION_STATS, DEMO_ACTION_TESTIMONIALS } from './actionsMock';

export async function fetchActionCategories(): Promise<ActionCategory[]> {
  // In a real app, fetch from Firestore
  return DEMO_ACTION_CATEGORIES.filter(c => c.isActive).sort((a, b) => a.order - b.order);
}

export async function fetchFAFEActions(limitCount?: number, featuredOnly = false): Promise<FAFEAction[]> {
  let actions = DEMO_ACTIONS;
  if (featuredOnly) {
    actions = actions.filter(a => a.isFeatured);
  }
  if (limitCount) {
    actions = actions.slice(0, limitCount);
  }
  return actions;
}

export async function fetchActionStats(): Promise<ActionStatistic[]> {
  return DEMO_ACTION_STATS.filter(s => s.isVisible).sort((a, b) => a.order - b.order);
}

export async function fetchActionTestimonials(): Promise<ActionTestimonial[]> {
  return DEMO_ACTION_TESTIMONIALS.filter(t => t.isVisible);
}
