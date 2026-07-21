import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const unsubscribe = notificationService.subscribeNotifications(
      firebaseUser.uid,
      (data) => {
        setNotifications(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser?.uid]);

  return { notifications, loading };
};
