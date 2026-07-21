import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { NetWorthAsset } from '../types';

export const netWorthService = {
  subscribeAssets(uid: string, onUpdate: (assets: NetWorthAsset[]) => void) {
    const q = query(
      collection(db, 'net_worth_assets'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const assets: NetWorthAsset[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as NetWorthAsset));
        onUpdate(assets);
      },
      (error) => {
        console.warn('Firestore net worth subscription error:', error);
      }
    );
  },

  async addAsset(uid: string, asset: Omit<NetWorthAsset, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'net_worth_assets'), {
      ...asset,
      userId: uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  calculateNetWorth(assets: NetWorthAsset[]) {
    const totalAssets = assets
      .filter((a) => a.type === 'Asset')
      .reduce((sum, a) => sum + a.value, 0);

    const totalLiabilities = assets
      .filter((a) => a.type === 'Liability')
      .reduce((sum, a) => sum + a.value, 0);

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    };
  }
};
