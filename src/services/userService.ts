import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { UserProfile } from '../types';

export const userService = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.warn('Error fetching user profile from Firestore:', error);
      return null;
    }
  },

  async saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...profile,
        uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.warn('Error saving user profile to Firestore:', error);
    }
  },

  async updateUserProfile(uid: string, updated: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updated,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Error updating user profile in Firestore:', error);
    }
  }
};
