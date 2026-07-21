import { 
  collection, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  writeBatch, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { NotificationItem } from '../types';

export const notificationService = {
  subscribeNotifications(uid: string, onUpdate: (notifs: NotificationItem[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifs: NotificationItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as NotificationItem));
        onUpdate(notifs);
      },
      (error) => {
        console.warn('Firestore notifications subscription fallback:', error);
      }
    );
  },

  async addNotification(uid: string, notif: Omit<NotificationItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notif,
      userId: uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async markNotificationRead(id: string): Promise<void> {
    const nRef = doc(db, 'notifications', id);
    await updateDoc(nRef, { read: true });
  },

  async markAllNotificationsRead(uid: string): Promise<void> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', uid),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });
    await batch.commit();
  }
};
