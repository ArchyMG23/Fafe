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
export const initAuth = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      useAuthStore.getState().setAuth(user);
      
      // Fetch user profile from Firestore
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
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
        } else {
          useAuthStore.getState().setProfile(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        useAuthStore.getState().setProfile(null);
      }
    } else {
      useAuthStore.getState().setAuth(null);
      useAuthStore.getState().setProfile(null);
    }
    
    useAuthStore.setState({ loading: false, initialized: true });
  });
};
