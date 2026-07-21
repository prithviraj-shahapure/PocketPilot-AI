import { 
  collection, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Subscription } from '../types';

export const subscriptionService = {
  subscribeSubscriptions(uid: string, onUpdate: (subs: Subscription[]) => void) {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const subs: Subscription[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Subscription));
        onUpdate(subs);
      },
      (error) => {
        console.warn('Firestore subscriptions subscription fallback:', error);
      }
    );
  },

  async addSubscription(uid: string, sub: Omit<Subscription, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'subscriptions'), {
      ...sub,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateSubscription(id: string, sub: Partial<Subscription>): Promise<void> {
    const sRef = doc(db, 'subscriptions', id);
    await updateDoc(sRef, {
      ...sub,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteSubscription(id: string): Promise<void> {
    const sRef = doc(db, 'subscriptions', id);
    await deleteDoc(sRef);
  }
};
