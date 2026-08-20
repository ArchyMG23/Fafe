import { create } from 'zustand';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
          useAuthStore.getState().setProfile(docSnap.data() as UserProfile);
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
