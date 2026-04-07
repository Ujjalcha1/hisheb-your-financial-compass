import { create } from 'zustand';

export type TransactionType = 'expense' | 'income' | 'lend' | 'borrow';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
  person?: string;
}

export interface AppState {
  user: { name: string; email: string } | null;
  transactions: Transaction[];
  isAuthenticated: boolean;
  setUser: (user: AppState['user']) => void;
  setAuthenticated: (v: boolean) => void;
  addTransaction: (t: Transaction) => void;
  removeTransaction: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: { name: 'Alex', email: 'alex@example.com' },
  transactions: [
    { id: '1', type: 'expense', amount: 45, category: 'Food', note: 'Lunch with team', date: '2026-04-07' },
    { id: '2', type: 'income', amount: 3200, category: 'Salary', note: 'Monthly salary', date: '2026-04-01' },
    { id: '3', type: 'expense', amount: 120, category: 'Transport', note: 'Uber rides', date: '2026-04-06' },
    { id: '4', type: 'expense', amount: 85, category: 'Shopping', note: 'Groceries', date: '2026-04-05' },
    { id: '5', type: 'lend', amount: 200, category: 'Lend', note: 'Movie tickets', date: '2026-04-04', person: 'Sarah' },
    { id: '6', type: 'borrow', amount: 150, category: 'Borrow', note: 'Dinner split', date: '2026-04-03', person: 'Mike' },
    { id: '7', type: 'expense', amount: 60, category: 'Entertainment', note: 'Netflix subscription', date: '2026-04-02' },
  ],
  isAuthenticated: false,
  setUser: (user) => set({ user }),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
  removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
}));
