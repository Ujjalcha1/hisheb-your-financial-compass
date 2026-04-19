import { create } from 'zustand';

export type TransactionType = 'expense' | 'income' | 'lend' | 'borrow';
export type PaymentMethod = 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet' | 'Other';

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Other'];

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
  person?: string;
  paymentMethod?: PaymentMethod;
}

export interface AppState {
  user: { name: string; email: string } | null;
  transactions: Transaction[];
  isAuthenticated: boolean;
  categories: string[];
  currency: string;
  setUser: (user: AppState['user']) => void;
  setAuthenticated: (v: boolean) => void;
  addTransaction: (t: Transaction) => void;
  removeTransaction: (id: string) => void;
  addCategory: (c: string) => void;
  removeCategory: (c: string) => void;
  setCurrency: (c: string) => void;
  resetAll: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: { name: 'Alex', email: 'alex@example.com' },
  transactions: [
    { id: '1', type: 'expense', amount: 45, category: 'Food', note: 'Lunch with team', date: '2026-04-07', paymentMethod: 'UPI' },
    { id: '2', type: 'income', amount: 3200, category: 'Salary', note: 'Monthly salary', date: '2026-04-01', paymentMethod: 'Net Banking' },
    { id: '3', type: 'expense', amount: 120, category: 'Transport', note: 'Uber rides', date: '2026-04-06', paymentMethod: 'Credit Card' },
    { id: '4', type: 'expense', amount: 85, category: 'Shopping', note: 'Groceries', date: '2026-04-05', paymentMethod: 'Debit Card' },
    { id: '5', type: 'lend', amount: 200, category: 'Lend', note: 'Movie tickets', date: '2026-04-04', person: 'Sarah', paymentMethod: 'Cash' },
    { id: '6', type: 'borrow', amount: 150, category: 'Borrow', note: 'Dinner split', date: '2026-04-03', person: 'Mike', paymentMethod: 'Cash' },
    { id: '7', type: 'expense', amount: 60, category: 'Entertainment', note: 'Netflix subscription', date: '2026-04-02', paymentMethod: 'Credit Card' },
  ],
  isAuthenticated: false,
  categories: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Housing', 'Health', 'Education', 'Other'],
  currency: '₹',
  setUser: (user) => set({ user }),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
  removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
  addCategory: (c) => set((s) => ({ categories: s.categories.includes(c) ? s.categories : [...s.categories, c] })),
  removeCategory: (c) => set((s) => ({ categories: s.categories.filter((x) => x !== c) })),
  setCurrency: (c) => set({ currency: c }),
  resetAll: () => set({ user: null, transactions: [], isAuthenticated: false }),
}));
