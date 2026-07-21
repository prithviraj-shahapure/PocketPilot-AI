import { collection, doc, query, where, onSnapshot, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { DocumentVaultItem } from '../types';

export const documentVaultService = {
  subscribeDocuments(uid: string, onUpdate: (docs: DocumentVaultItem[]) => void) {
    const q = query(
      collection(db, 'document_vault'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const docs: DocumentVaultItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as DocumentVaultItem));
        onUpdate(docs);
      },
      (error) => {
        console.warn('Firestore document vault subscription error:', error);
      }
    );
  },

  async addDocument(uid: string, docData: Omit<DocumentVaultItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'document_vault'), {
      ...docData,
      userId: uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async deleteDocument(id: string): Promise<void> {
    const ref = doc(db, 'document_vault', id);
    await deleteDoc(ref);
  }
};
