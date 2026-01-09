import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Budget } from "@/types";
import type { Database } from "@/lib/database.types";
import { useTransactions } from "./useTransactions";

type DbBudget = Database['public']['Tables']['budgets']['Row'];
type DbBudgetInsert = Database['public']['Tables']['budgets']['Insert'];

const DEFAULT_BUDGETS: Budget[] = [
  { id: 1, category: "Food & Dining", limit: 8000, spent: 0, period: "monthly" },
  { id: 2, category: "Shopping", limit: 5000, spent: 0, period: "monthly" },
  { id: 3, category: "Entertainment", limit: 2000, spent: 0, period: "monthly" },
  { id: 4, category: "Transport", limit: 3000, spent: 0, period: "monthly" },
  { id: 5, category: "Bills & Utilities", limit: 5000, spent: 0, period: "monthly" },
];

export function useBudgets() {
  const { user, isSupabaseEnabled } = useAuth();
  const { transactions } = useTransactions();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = user ? `pb-budgets-${user.email}` : "pb-budgets-guest";

  // Load budgets
  const loadBudgets = useCallback(async () => {
    setIsLoading(true);

    if (!user) {
      setBudgets(DEFAULT_BUDGETS);
      setIsLoading(false);
      return;
    }

    if (isSupabaseEnabled && user.id !== 'local') {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading budgets:', error);
        setBudgets(DEFAULT_BUDGETS);
      } else if (data && data.length > 0) {
        const typedData = data as unknown as DbBudget[];
        setBudgets(typedData.map(b => ({
          id: b.id,
          category: b.category,
          limit: Number(b.limit),
          spent: 0, // Will be calculated from transactions
          period: b.period as 'monthly' | 'weekly',
        })));
      } else {
        // Insert default budgets for new users
        const toInsert: DbBudgetInsert[] = DEFAULT_BUDGETS.map(b => ({
          user_id: user.id,
          category: b.category,
          limit: b.limit,
          period: b.period,
        }));

        const { data: inserted } = await supabase
          .from('budgets')
          .insert(toInsert as any)
          .select();

        if (inserted) {
          const typedInserted = inserted as unknown as DbBudget[];
          setBudgets(typedInserted.map(b => ({
            id: b.id,
            category: b.category,
            limit: Number(b.limit),
            spent: 0,
            period: b.period as 'monthly' | 'weekly',
          })));
        } else {
          setBudgets(DEFAULT_BUDGETS);
        }
      }
    } else {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setBudgets(JSON.parse(saved));
        } catch {
          setBudgets(DEFAULT_BUDGETS);
        }
      } else {
        setBudgets(DEFAULT_BUDGETS);
      }
    }
    setIsLoading(false);
  }, [user, isSupabaseEnabled, storageKey]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Save to localStorage when using local mode
  useEffect(() => {
    if (user && (!isSupabaseEnabled || user.id === 'local') && !isLoading) {
      localStorage.setItem(storageKey, JSON.stringify(budgets));
    }
  }, [budgets, storageKey, user, isSupabaseEnabled, isLoading]);

  // Calculate spent amounts from transactions
  const budgetsWithSpent = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get this month's transactions
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear &&
             t.amount < 0;
    });

    // Calculate spent per category
    const spentByCategory: Record<string, number> = {};
    thisMonthTransactions.forEach(t => {
      const cat = t.category || "Other";
      spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.abs(t.amount);
    });

    return budgets.map(b => ({
      ...b,
      spent: spentByCategory[b.category] || 0,
    }));
  }, [budgets, transactions]);

  const addBudget = useCallback(async (budget: Omit<Budget, "id" | "spent">) => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const insertData: DbBudgetInsert = {
        user_id: user.id,
        category: budget.category,
        limit: budget.limit,
        period: budget.period,
      };
      
      const { data, error } = await supabase
        .from('budgets')
        .insert(insertData as any)
        .select()
        .single();

      if (error) {
        console.error('Error adding budget:', error);
        return;
      }

      if (data) {
        const typedData = data as unknown as DbBudget;
        setBudgets(prev => [...prev, {
          id: typedData.id,
          category: typedData.category,
          limit: Number(typedData.limit),
          spent: 0,
          period: typedData.period as 'monthly' | 'weekly',
        }]);
      }
    } else {
      const newId = budgets.length > 0 
        ? Math.max(...budgets.map(b => b.id)) + 1 
        : 1;
      setBudgets(prev => [...prev, { ...budget, id: newId, spent: 0 }]);
    }
  }, [budgets, isSupabaseEnabled, user]);

  const updateBudget = useCallback(async (id: number, updates: Partial<Budget>) => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.limit !== undefined) dbUpdates.limit = updates.limit;
      if (updates.period !== undefined) dbUpdates.period = updates.period;

      const { error } = await supabase
        .from('budgets')
        // @ts-ignore - Supabase types don't infer properly when not configured
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating budget:', error);
        return;
      }
    }
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, [isSupabaseEnabled, user]);

  const deleteBudget = useCallback(async (id: number) => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting budget:', error);
        return;
      }
    }
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, [isSupabaseEnabled, user]);

  // Computed values
  const totals = useMemo(() => {
    const totalLimit = budgetsWithSpent.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalLimit - totalSpent;
    const percentUsed = totalLimit > 0 
      ? Math.round((totalSpent / totalLimit) * 100) 
      : 0;
    
    return { totalLimit, totalSpent, remaining, percentUsed };
  }, [budgetsWithSpent]);

  const overBudget = useMemo(() => 
    budgetsWithSpent.filter(b => b.spent > b.limit), 
  [budgetsWithSpent]);

  const nearLimit = useMemo(() => 
    budgetsWithSpent.filter(b => b.spent >= b.limit * 0.8 && b.spent <= b.limit), 
  [budgetsWithSpent]);

  return {
    budgets: budgetsWithSpent,
    setBudgets,
    isLoading,
    addBudget,
    updateBudget,
    deleteBudget,
    totals,
    overBudget,
    nearLimit,
    storageKey,
  };
}
