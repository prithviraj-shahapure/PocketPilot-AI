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
import { RecurringTransaction } from '../types';
import { transactionService } from './transactionService';

export const recurringService = {
  subscribeRecurring(uid: string, onUpdate: (items: RecurringTransaction[]) => void) {
    const q = query(
      collection(db, 'recurring_transactions'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items: RecurringTransaction[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as RecurringTransaction));
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore recurring subscription error:', error);
      }
    );
  },

  async addRecurring(uid: string, item: Omit<RecurringTransaction, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'recurring_transactions'), {
      ...item,
      userId: uid,
      status: item.status || 'Active',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async togglePause(id: string, currentStatus: 'Active' | 'Paused'): Promise<void> {
    const rRef = doc(db, 'recurring_transactions', id);
    await updateDoc(rRef, {
      status: currentStatus === 'Active' ? 'Paused' : 'Active',
    });
  },

  async skipNext(id: string, nextDueDate: string, frequency: string): Promise<void> {
    const rRef = doc(db, 'recurring_transactions', id);
    const dateObj = new Date(nextDueDate);
    if (frequency === 'Monthly') dateObj.setMonth(dateObj.getMonth() + 1);
    else if (frequency === 'Weekly') dateObj.setDate(dateObj.getDate() + 7);
    else if (frequency === 'Daily') dateObj.setDate(dateObj.getDate() + 1);
    else if (frequency === 'Yearly') dateObj.setFullYear(dateObj.getFullYear() + 1);

    await updateDoc(rRef, {
      nextDueDate: dateObj.toISOString().split('T')[0],
    });
  },

  async deleteRecurring(id: string): Promise<void> {
    const rRef = doc(db, 'recurring_transactions', id);
    await deleteDoc(rRef);
  },

  async autoProcessRecurring(uid: string, items: RecurringTransaction[]): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    for (const item of items) {
      if (item.status === 'Active' && item.nextDueDate <= today) {
        // Auto-generate transaction into ledger
        await transactionService.addTransaction(uid, {
          title: `${item.title} (Recurring)`,
          amount: item.amount,
          type: item.type,
          category: item.category,
          merchant: item.merchant || item.title,
          paymentMethod: item.paymentMethod,
          date: today,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: `Auto-generated recurring ${item.frequency.toLowerCase()} schedule`,
          status: 'Completed',
        });

        // Advance next due date
        await this.skipNext(item.id, item.nextDueDate, item.frequency);
      }
    }
  }
};
