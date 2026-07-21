import { collection, doc, query, where, onSnapshot, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { InvestmentItem } from '../types';

export const investmentService = {
  subscribeInvestments(uid: string, onUpdate: (items: InvestmentItem[]) => void) {
    const q = query(
      collection(db, 'investments'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items: InvestmentItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as InvestmentItem));
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore investments subscription error:', error);
      }
    );
  },

  async addInvestment(uid: string, item: Omit<InvestmentItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'investments'), {
      ...item,
      userId: uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async deleteInvestment(id: string): Promise<void> {
    const ref = doc(db, 'investments', id);
    await deleteDoc(ref);
  },

  calculatePortfolio(items: InvestmentItem[]) {
    const totalInvested = items.reduce((s, i) => s + i.investedAmount, 0);
    const totalCurrentValue = items.reduce((s, i) => s + i.currentValue, 0);
    const totalProfit = totalCurrentValue - totalInvested;
    const returnPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrentValue,
      totalProfit,
      returnPct: Math.round(returnPct * 10) / 10,
    };
  }
};
