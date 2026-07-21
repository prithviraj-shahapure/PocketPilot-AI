import { 
  collection, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Goal } from '../types';

export const goalService = {
  subscribeGoals(uid: string, onUpdate: (goals: Goal[]) => void) {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const goals: Goal[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const targetAmount = data.targetAmount || 0;
          const currentAmount = data.currentAmount ?? data.savedAmount ?? 0;
          
          return {
            id: docSnap.id,
            title: data.title || data.goalName || 'Savings Goal',
            targetAmount,
            currentAmount,
            targetDate: data.targetDate || data.deadline || '2026-12-31',
            categoryIcon: data.categoryIcon || data.icon || 'Target',
            category: data.category || 'Shopping',
            notes: data.notes || '',
            color: data.color || '#4F46E5',
            completed: data.completed ?? (targetAmount > 0 && currentAmount >= targetAmount),
            userId: data.userId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as Goal;
        });
        onUpdate(goals);
      },
      (error) => {
        console.warn('Firestore goals subscription fallback:', error);
      }
    );
  },

  async addGoal(uid: string, goal: Omit<Goal, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'goals'), {
      userId: uid,
      title: goal.title,
      goalName: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount || 0,
      savedAmount: goal.currentAmount || 0,
      targetDate: goal.targetDate,
      deadline: goal.targetDate,
      categoryIcon: goal.categoryIcon || 'Target',
      icon: goal.categoryIcon || 'Target',
      category: goal.category || 'Shopping',
      notes: goal.notes || '',
      color: goal.color || '#4F46E5',
      completed: goal.completed || (goal.targetAmount > 0 && (goal.currentAmount || 0) >= goal.targetAmount),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateGoal(id: string, goal: Partial<Goal>): Promise<void> {
    const gRef = doc(db, 'goals', id);
    const updates: any = {
      ...goal,
      updatedAt: serverTimestamp(),
    };
    if (goal.title) updates.goalName = goal.title;
    if (goal.currentAmount !== undefined) updates.savedAmount = goal.currentAmount;
    if (goal.targetDate) updates.deadline = goal.targetDate;
    if (goal.categoryIcon) updates.icon = goal.categoryIcon;

    if (goal.currentAmount !== undefined && goal.targetAmount !== undefined) {
      updates.completed = goal.currentAmount >= goal.targetAmount;
    }
    await updateDoc(gRef, updates);
  },

  async toggleGoalComplete(id: string, currentCompleted: boolean): Promise<void> {
    const gRef = doc(db, 'goals', id);
    await updateDoc(gRef, {
      completed: !currentCompleted,
      updatedAt: serverTimestamp(),
    });
  },

  async contributeToGoal(id: string, amount: number, currentAmount: number, targetAmount: number): Promise<void> {
    const gRef = doc(db, 'goals', id);
    const newAmount = currentAmount + amount;
    await updateDoc(gRef, {
      currentAmount: newAmount,
      savedAmount: newAmount,
      completed: newAmount >= targetAmount,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteGoal(id: string): Promise<void> {
    const gRef = doc(db, 'goals', id);
    await deleteDoc(gRef);
  }
};
