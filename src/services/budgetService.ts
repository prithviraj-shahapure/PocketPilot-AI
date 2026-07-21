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
import { Budget } from '../types';

export const budgetService = {
  subscribeBudgets(uid: string, onUpdate: (budgets: Budget[]) => void) {
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const budgets: Budget[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Budget));
        onUpdate(budgets);
      },
      (error) => {
        console.warn('Firestore budgets subscription fallback:', error);
      }
    );
  },

  async addBudget(uid: string, budget: Omit<Budget, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'budgets'), {
      ...budget,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateBudget(id: string, budget: Partial<Budget>): Promise<void> {
    const bRef = doc(db, 'budgets', id);
    await updateDoc(bRef, {
      ...budget,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteBudget(id: string): Promise<void> {
    const bRef = doc(db, 'budgets', id);
    await deleteDoc(bRef);
  }
};
