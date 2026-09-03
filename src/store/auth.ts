import { create } from 'zustand';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthState {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  userProfile: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,
  isAdmin: false,
  setAuth: (user) => set({ currentUser: user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ 
    userProfile: profile, 
    isAdmin: profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' 
  }),
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  }
}));

// Initialize auth listener
let profileUnsubscribe: (() => void) | null = null;

export const initAuth = () => {
  onAuthStateChanged(auth, async (user) => {
    if (profileUnsubscribe) {
      profileUnsubscribe();
      profileUnsubscribe = null;
    }

    if (user) {
      useAuthStore.getState().setAuth(user);
      
      // Listen to user profile from Firestore in real-time
      try {
        const { onSnapshot, setDoc, updateDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'users', user.uid);
        
        profileUnsubscribe = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            
            // Auto-upgrade founder account to SUPER_ADMIN
            if (user.email === 'yombivictor@gmail.com' && profileData.role !== 'SUPER_ADMIN') {
              try {
                await updateDoc(docRef, { role: 'SUPER_ADMIN' });
                profileData.role = 'SUPER_ADMIN';
                console.log('Founder account automatically upgraded to SUPER_ADMIN');
              } catch (e) {
                console.error('Failed to upgrade founder account', e);
              }
            }
            
            useAuthStore.getState().setProfile(profileData);
            useAuthStore.setState({ loading: false, initialized: true });
          } else {
            // Auto-repair: Profile is missing! (Race condition from signup or incomplete Google login)
            const now = Date.now();
            const isSuperAdmin = user.email === 'yombivictor@gmail.com';
            
            const fallbackProfile = {
              id: user.uid,
              firstName: user.displayName?.split(' ')[0] || (isSuperAdmin ? 'Super' : 'Utilisateur'),
              lastName: user.displayName?.split(' ').slice(1).join(' ') || (isSuperAdmin ? 'Admin' : ''),
              email: user.email || '',
              phone: '',
              country: 'Cameroun',
              city: 'Yaoundé',
              role: isSuperAdmin ? 'SUPER_ADMIN' : 'MEMBER',
              membershipStatus: isSuperAdmin ? 'ACTIVE' : 'PENDING',
              status: 'ACTIVE',
              createdAt: now,
              updatedAt: now,
              lastLoginAt: now
            };
            
            try {
              // Create the missing profile.
              // We use merge: true so that if Register.tsx also calls setDoc simultaneously, 
              // we don't completely overwrite their specific form fields (like phone, city, etc).
              await setDoc(docRef, fallbackProfile, { merge: true });
              // Note: setDoc will trigger onSnapshot again immediately with the new data.
            } catch (err) {
              console.error('Failed to auto-repair missing profile:', err);
              // Fallback if we don't have permission to write (which shouldn't happen with proper rules)
              useAuthStore.getState().setProfile(null);
              useAuthStore.setState({ loading: false, initialized: true });
            }
          }
        }, (error) => {
          console.error('Error in profile snapshot:', error);
          useAuthStore.getState().setProfile(null);
          useAuthStore.setState({ loading: false, initialized: true });
        });
        
      } catch (error) {
        console.error('Error setting up snapshot:', error);
        useAuthStore.getState().setProfile(null);
        useAuthStore.setState({ loading: false, initialized: true });
      }
    } else {
      useAuthStore.getState().setAuth(null);
      useAuthStore.getState().setProfile(null);
      useAuthStore.setState({ loading: false, initialized: true });
    }
  });
};
