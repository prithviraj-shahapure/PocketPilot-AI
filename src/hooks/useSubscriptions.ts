import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { Subscription } from '../types';
import { useAuth } from '../context/AuthContext';

export const useSubscriptions = () => {
  const { firebaseUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscriptionService.subscribeSubscriptions(
      firebaseUser.uid,
      (data) => {
        setSubscriptions(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser?.uid]);

  return { subscriptions, loading };
};
