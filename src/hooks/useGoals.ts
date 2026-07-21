import { useState, useEffect } from 'react';
import { goalService } from '../services/goalService';
import { Goal } from '../types';
import { useAuth } from '../context/AuthContext';

export const useGoals = () => {
  const { firebaseUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const unsubscribe = goalService.subscribeGoals(
      firebaseUser.uid,
      (data) => {
        setGoals(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser?.uid]);

  return { goals, loading };
};
