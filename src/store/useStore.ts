import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  isLoading: boolean;
  categories: string[];
  customCategories: string[];
  currency: string;
  setUser: (user: AppState['user']) => void;
  setAuthenticated: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  addTransaction: (t: Transaction) => void;
  setTransactions: (t: Transaction[]) => void;
  removeTransaction: (id: string) => void;
  addCategory: (c: string) => void;
  removeCategory: (c: string) => void;
  setCurrency: (c: string) => void;
  resetAll: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      transactions: [],
      isAuthenticated: false,
      isLoading: false,
      categories: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Housing', 'Health', 'Education', 'Other'],
      customCategories: [],
      currency: '₹',
      setUser: (user) => set({ user }),
      setAuthenticated: (v) => set({ isAuthenticated: v }),
      setLoading: (v) => set({ isLoading: v }),
      addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
      setTransactions: (transactions) => set({ transactions }),
      removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      addCategory: (c) => set((s) => ({ customCategories: s.customCategories.includes(c) ? s.customCategories : [...s.customCategories, c] })),
      removeCategory: (c) => set((s) => ({ customCategories: s.customCategories.filter((x) => x !== c) })),
      setCurrency: (c) => set({ currency: c }),
      resetAll: () => set({ user: null, transactions: [], isAuthenticated: false, customCategories: [] }),
    }),
    {
      name: 'hisheb-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : sessionStorage)),
    }
  )
);
