import { supabase } from './supabase';
import { useStore, Transaction, PaymentMethod } from '@/store/useStore';
import { toast } from 'sonner';

export const syncTransactions = async () => {
  const setTransactions = useStore.getState().setTransactions;
  const setLoading = useStore.getState().setLoading;

  try {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    if (data) {
      setTransactions(data.map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount),
        category: t.category,
        note: t.note || '',
        date: t.date,
        person: t.person || undefined,
        paymentMethod: t.payment_method as PaymentMethod,
      })));
    }
  } catch (err: any) {
    console.error('Fetch error:', err);
    toast.error('Failed to sync with cloud');
  } finally {
    setLoading(false);
  }
};

export const addTransactionRemote = async (txnData: any) => {
  const addTransaction = useStore.getState().addTransaction;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([txnData])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      const newTxn: Transaction = {
        id: data.id,
        type: data.type,
        amount: parseFloat(data.amount),
        category: data.category,
        note: data.note || '',
        date: data.date,
        person: data.person || undefined,
        paymentMethod: data.payment_method as PaymentMethod,
      };
      addTransaction(newTxn);
      return { success: true, data: newTxn };
    }
  } catch (err: any) {
    console.error('Insert error:', err);
    return { success: false, error: err.message };
  }
  return { success: false, error: 'Unknown error' };
};

export const deleteTransactionRemote = async (id: string) => {
  const removeTransaction = useStore.getState().removeTransaction;

  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    removeTransaction(id);
    return { success: true };
  } catch (err: any) {
    console.error('Delete error:', err);
    return { success: false, error: err.message };
  }
};

export const updateTransactionRemote = async (id: string, txnData: any) => {
  const setTransactions = useStore.getState().setTransactions;
  const transactions = useStore.getState().transactions;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(txnData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      const updatedTxn: Transaction = {
        id: data.id,
        type: data.type,
        amount: parseFloat(data.amount),
        category: data.category,
        note: data.note || '',
        date: data.date,
        person: data.person || undefined,
        paymentMethod: data.payment_method as PaymentMethod,
      };
      
      setTransactions(transactions.map(t => t.id === id ? updatedTxn : t));
      return { success: true, data: updatedTxn };
    }
  } catch (err: any) {
    console.error('Update error:', err);
    return { success: false, error: err.message };
  }
  return { success: false, error: 'Unknown error' };
};
