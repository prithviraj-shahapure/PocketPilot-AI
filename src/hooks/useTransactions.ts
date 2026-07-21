import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction } from '../types';
import { useAuth } from '../context/AuthContext';

export const useTransactions = () => {
  const { firebaseUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const unsubscribe = transactionService.subscribeTransactions(
      firebaseUser.uid,
      (data) => {
        setTransactions(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser?.uid]);

  return { transactions, loading };
};
