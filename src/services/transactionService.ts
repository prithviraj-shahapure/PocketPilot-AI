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
import { Transaction } from '../types';

export const transactionService = {
  subscribeTransactions(uid: string, onUpdate: (txs: Transaction[]) => void) {
    // Single-field query to avoid missing composite index errors in Firestore
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const txs: Transaction[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Transaction));

        // Sort in-memory by date descending
        txs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

        onUpdate(txs);
      },
      (error) => {
        console.warn('Firestore transactions subscription fallback:', error);
      }
    );
  },

  async addTransaction(uid: string, tx: Omit<Transaction, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...tx,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateTransaction(id: string, tx: Partial<Transaction>): Promise<void> {
    const txRef = doc(db, 'transactions', id);
    await updateDoc(txRef, {
      ...tx,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteTransaction(id: string): Promise<void> {
    const txRef = doc(db, 'transactions', id);
    await deleteDoc(txRef);
  }
};
