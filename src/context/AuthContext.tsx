import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  signOut, 
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import { UserProfile } from '../types';
import { initialProfile } from '../data/mockData';

interface AuthContextType {
  user: UserProfile;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pocketpilot_user');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  // Observe Firebase Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: FirebaseUser | null) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        // Map Firebase user details to PocketPilot profile
        setUser((prev) => ({
          ...prev,
          name: currentUser.displayName || prev.name || 'Alex Mercer',
          email: currentUser.email || prev.email,
          avatarUrl: currentUser.photoURL || prev.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'Alex Mercer')}&background=4F46E5&color=fff`,
        }));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save profile state locally
  useEffect(() => {
    localStorage.setItem('pocketpilot_user', JSON.stringify(user));
  }, [user]);

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const result = await signInWithEmailAndPassword(auth, email, password);
    setFirebaseUser(result.user);
    setUser((prev) => ({
      ...prev,
      name: result.user.displayName || prev.name,
      email: result.user.email || email,
      avatarUrl: result.user.photoURL || prev.avatarUrl,
    }));
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name && result.user) {
      await updateFirebaseProfile(result.user, { displayName: name });
    }
    setFirebaseUser(result.user);
    setUser((prev) => ({
      ...prev,
      name: name || 'Alex Mercer',
      email: result.user.email || email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`,
    }));
  };

  const googleLogin = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    setFirebaseUser(result.user);
    setUser((prev) => ({
      ...prev,
      name: result.user.displayName || prev.name,
      email: result.user.email || prev.email,
      avatarUrl: result.user.photoURL || prev.avatarUrl,
    }));
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!firebaseUser,
        loading,
        login,
        register,
        googleLogin,
        resetPassword,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
