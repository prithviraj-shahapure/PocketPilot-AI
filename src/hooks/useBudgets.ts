import { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import { Budget } from '../types';
import { useAuth } from '../context/AuthContext';

export const useBudgets = () => {
  const { firebaseUser } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    const unsubscribe = budgetService.subscribeBudgets(
      firebaseUser.uid,
      (data) => {
        setBudgets(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser?.uid]);

  return { budgets, loading };
};
