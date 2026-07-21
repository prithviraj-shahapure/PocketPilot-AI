import { collection, doc, query, where, onSnapshot, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { LoanItem } from '../types';

export const loanService = {
  subscribeLoans(uid: string, onUpdate: (loans: LoanItem[]) => void) {
    const q = query(
      collection(db, 'loans'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const loans: LoanItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as LoanItem));
        onUpdate(loans);
      },
      (error) => {
        console.warn('Firestore loans subscription error:', error);
      }
    );
  },

  async addLoan(uid: string, loan: Omit<LoanItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'loans'), {
      ...loan,
      userId: uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async deleteLoan(id: string): Promise<void> {
    const ref = doc(db, 'loans', id);
    await deleteDoc(ref);
  },

  calculateTotalDebt(loans: LoanItem[]) {
    const totalOutstanding = loans.reduce((s, l) => s + l.outstandingBalance, 0);
    const totalMonthlyEmi = loans.reduce((s, l) => s + l.emiAmount, 0);

    return {
      totalOutstanding,
      totalMonthlyEmi,
    };
  }
};
