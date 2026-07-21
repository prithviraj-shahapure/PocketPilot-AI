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
import { BillItem } from '../types';

export const billService = {
  subscribeBills(uid: string, onUpdate: (bills: BillItem[]) => void) {
    const q = query(
      collection(db, 'bills'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const today = new Date().toISOString().split('T')[0];
        const bills: BillItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let status = data.status || 'Upcoming';
          if (status !== 'Paid' && data.dueDate < today) {
            status = 'Overdue';
          }
          return {
            id: docSnap.id,
            ...data,
            status,
          } as BillItem;
        });
        onUpdate(bills);
      },
      (error) => {
        console.warn('Firestore bills subscription error:', error);
      }
    );
  },

  async addBill(uid: string, bill: Omit<BillItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'bills'), {
      ...bill,
      userId: uid,
      status: bill.status || 'Upcoming',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async markBillPaid(id: string): Promise<void> {
    const bRef = doc(db, 'bills', id);
    await updateDoc(bRef, {
      status: 'Paid',
    });
  },

  async toggleAutoPay(id: string, currentAutoPay: boolean): Promise<void> {
    const bRef = doc(db, 'bills', id);
    await updateDoc(bRef, {
      autoPay: !currentAutoPay,
    });
  },

  async deleteBill(id: string): Promise<void> {
    const bRef = doc(db, 'bills', id);
    await deleteDoc(bRef);
  }
};
