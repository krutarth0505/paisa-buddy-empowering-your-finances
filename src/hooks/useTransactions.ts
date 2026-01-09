import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Transaction } from "@/types";
import type { Database } from "@/lib/database.types";

type DbTransaction = Database['public']['Tables']['transactions']['Row'];
type DbTransactionInsert = Database['public']['Tables']['transactions']['Insert'];

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 1, name: "Swiggy Order", category: "Food & Dining", amount: -485, date: "2024-12-30", type: "Wants" },
  { id: 2, name: "Monthly Salary", category: "Income", amount: 52000, date: "2024-12-29", type: "Income" },
  { id: 3, name: "Electricity Bill", category: "Bills & Utilities", amount: -1850, date: "2024-12-28", type: "Essentials" },
  { id: 4, name: "Amazon Shopping", category: "Shopping", amount: -2999, date: "2024-12-27", type: "Wants" },
  { id: 5, name: "Petrol", category: "Transport", amount: -1200, date: "2024-12-26", type: "Needs" },
  { id: 6, name: "Rent Payment", category: "Housing", amount: -15000, date: "2024-12-25", type: "Essentials" },
  { id: 7, name: "Netflix Subscription", category: "Entertainment", amount: -649, date: "2024-12-24", type: "Wants" },
  { id: 8, name: "Grocery - BigBasket", category: "Food & Dining", amount: -2340, date: "2024-12-23", type: "Essentials" },
  { id: 9, name: "Doctor Visit", category: "Healthcare", amount: -800, date: "2024-12-22", type: "Needs" },
  { id: 10, name: "Freelance Payment", category: "Income", amount: 15000, date: "2024-12-21", type: "Income" },
];

interface UseTransactionsOptions {
  showDemoForGuests?: boolean;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { showDemoForGuests = false } = options;
  const { user, isSupabaseEnabled } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = user ? `pb-transactions-${user.email}` : "pb-transactions-guest";

  // Load transactions
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    console.log("Loading transactions...", { user, isSupabaseEnabled, storageKey });
    
    if (!user && showDemoForGuests) {
      setTransactions(DEMO_TRANSACTIONS);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    if (isSupabaseEnabled && user.id !== 'local') {
      // Load from Supabase
      console.log("Fetching from Supabase for user:", user.id);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading transactions from Supabase:', error);
        // Fallback to localStorage if Supabase fails
        console.log("Falling back to localStorage...");
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            setTransactions(JSON.parse(saved));
          } catch {
            setTransactions([]);
          }
        } else {
          setTransactions([]);
        }
      } else {
        console.log("Supabase returned:", data?.length, "transactions");
        const typedData = data as unknown as DbTransaction[];
        const supabaseTransactions = typedData?.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          amount: Number(t.amount),
          date: t.date,
          type: t.type as Transaction['type'],
        })) || [];
        
        // If Supabase is empty but localStorage has data, use localStorage
        if (supabaseTransactions.length === 0) {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            try {
              const localTransactions = JSON.parse(saved);
              if (localTransactions.length > 0) {
                console.log("Using localStorage data:", localTransactions.length, "transactions");
                setTransactions(localTransactions);
                setIsLoading(false);
                return;
              }
            } catch {
              // ignore parse errors
            }
          }
        }
        
        setTransactions(supabaseTransactions);
      }
    } else {
      // Fallback to localStorage
      console.log("Loading from localStorage:", storageKey);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log("localStorage has:", parsed.length, "transactions");
          setTransactions(parsed);
        } catch {
          setTransactions([]);
        }
      } else {
        setTransactions([]);
      }
    }
    setIsLoading(false);
  }, [user, isSupabaseEnabled, showDemoForGuests, storageKey]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Save to localStorage when using local storage mode
  useEffect(() => {
    if (user && (!isSupabaseEnabled || user.id === 'local') && !isLoading) {
      localStorage.setItem(storageKey, JSON.stringify(transactions));
    }
  }, [transactions, storageKey, user, isSupabaseEnabled, isLoading]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, "id">) => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const insertData: DbTransactionInsert = {
        user_id: user.id,
        name: transaction.name,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type,
      };
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(insertData as any)
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        return;
      }

      if (data) {
        const typedData = data as unknown as DbTransaction;
        setTransactions(prev => [{
          id: typedData.id,
          name: typedData.name,
          category: typedData.category,
          amount: Number(typedData.amount),
          date: typedData.date,
          type: typedData.type as Transaction['type'],
        }, ...prev]);
      }
    } else {
      const newId = transactions.length > 0 
        ? Math.max(...transactions.map(t => t.id)) + 1 
        : 1;
      setTransactions(prev => [{ ...transaction, id: newId }, ...prev]);
    }
  }, [transactions, isSupabaseEnabled, user]);

  const updateTransaction = useCallback(async (id: number, updates: Partial<Transaction>) => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const { error } = await supabase
        .from('transactions')
        // @ts-ignore - Supabase types don't infer properly when not configured
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating transaction:', error);
        return;
      }
    }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [isSupabaseEnabled, user]);

  const deleteTransaction = useCallback(async (id: number) => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting transaction:', error);
        return;
      }
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [isSupabaseEnabled, user]);

  const clearAll = useCallback(async () => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing transactions:', error);
        return;
      }
    }
    setTransactions([]);
    localStorage.removeItem(storageKey);
  }, [storageKey, isSupabaseEnabled, user]);

  const importTransactions = useCallback(async (newTransactions: Transaction[]) => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const toInsert: DbTransactionInsert[] = newTransactions.map(t => ({
        user_id: user.id,
        name: t.name,
        category: t.category,
        amount: t.amount,
        date: t.date,
        type: t.type,
      }));

      const { data, error } = await supabase
        .from('transactions')
        .insert(toInsert as any)
        .select();

      if (error) {
        console.error('Error importing transactions:', error);
        return;
      }

      if (data) {
        const typedData = data as unknown as DbTransaction[];
        const imported = typedData.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          amount: Number(t.amount),
          date: t.date,
          type: t.type as Transaction['type'],
        }));
        setTransactions(prev => [...imported, ...prev]);
      }
    } else {
      setTransactions(prev => [...newTransactions, ...prev]);
    }
  }, [isSupabaseEnabled, user]);

  // Computed values
  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = income - expenses;
    const savingsRate = income > 0 
      ? Math.max(0, Math.round(((income - expenses) / income) * 100)) 
      : 0;
    
    return { income, expenses, balance, savingsRate };
  }, [transactions]);

  const byCategory = useMemo(() => {
    const grouped: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.amount < 0) {
        const cat = t.category || "Other";
        grouped[cat] = (grouped[cat] || 0) + Math.abs(t.amount);
      }
    });
    return grouped;
  }, [transactions]);

  const byType = useMemo(() => {
    const grouped: Record<string, number> = {
      Essentials: 0,
      Needs: 0,
      Wants: 0,
      Income: 0,
    };
    transactions.forEach(t => {
      if (t.type && grouped[t.type] !== undefined) {
        grouped[t.type] += Math.abs(t.amount);
      }
    });
    return grouped;
  }, [transactions]);

  return {
    transactions,
    setTransactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAll,
    importTransactions,
    totals,
    byCategory,
    byType,
    storageKey,
  };
}
