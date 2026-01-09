import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Goal } from "@/types";
import type { Database } from "@/lib/database.types";

type DbGoal = Database['public']['Tables']['goals']['Row'];
type DbGoalInsert = Database['public']['Tables']['goals']['Insert'];

const GOAL_COLORS: Record<string, string> = {
  Emergency: "bg-primary",
  Vacation: "bg-accent",
  Education: "bg-warning",
  Home: "bg-secondary",
  Vehicle: "bg-muted",
  Other: "bg-success",
};

export const getColorForType = (type: string) => GOAL_COLORS[type] ?? "bg-primary";

export function useGoals() {
  const { user, isSupabaseEnabled } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = user ? `pb-goals-${user.email}` : "pb-goals-guest";

  // Load goals
  const loadGoals = useCallback(async () => {
    setIsLoading(true);

    if (!user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    if (isSupabaseEnabled && user.id !== 'local') {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading goals:', error);
        setGoals([]);
      } else {
        const typedData = data as unknown as DbGoal[];
        setGoals(typedData?.map(g => ({
          id: g.id,
          name: g.name,
          type: g.type as Goal['type'],
          current: Number(g.current),
          target: Number(g.target),
          deadline: g.deadline || '',
          monthlyTarget: Number(g.monthly_target),
          color: g.color,
        })) || []);
      }
    } else {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setGoals(JSON.parse(saved));
        } catch {
          setGoals([]);
        }
      } else {
        setGoals([]);
      }
    }
    setIsLoading(false);
  }, [user, isSupabaseEnabled, storageKey]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Save to localStorage when using local mode
  useEffect(() => {
    if (user && (!isSupabaseEnabled || user.id === 'local') && !isLoading) {
      localStorage.setItem(storageKey, JSON.stringify(goals));
    }
  }, [goals, storageKey, user, isSupabaseEnabled, isLoading]);

  const addGoal = useCallback(async (goal: Omit<Goal, "id" | "color">) => {
    const color = getColorForType(goal.type);

    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const insertData: DbGoalInsert = {
        user_id: user.id,
        name: goal.name,
        type: goal.type,
        current: goal.current,
        target: goal.target,
        deadline: goal.deadline || null,
        monthly_target: goal.monthlyTarget,
        color,
      };
      
      const { data, error } = await supabase
        .from('goals')
        .insert(insertData as any)
        .select()
        .single();

      if (error) {
        console.error('Error adding goal:', error);
        return;
      }

      if (data) {
        const typedData = data as unknown as DbGoal;
        setGoals(prev => [{
          id: typedData.id,
          name: typedData.name,
          type: typedData.type as Goal['type'],
          current: Number(typedData.current),
          target: Number(typedData.target),
          deadline: typedData.deadline || '',
          monthlyTarget: Number(typedData.monthly_target),
          color: typedData.color,
        }, ...prev]);
      }
    } else {
      const newId = goals.length > 0 
        ? Math.max(...goals.map(g => g.id)) + 1 
        : 1;
      setGoals(prev => [{ ...goal, id: newId, color }, ...prev]);
    }
  }, [goals, isSupabaseEnabled, user]);

  const updateGoal = useCallback(async (id: number, updates: Partial<Goal>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) {
      dbUpdates.type = updates.type;
      dbUpdates.color = getColorForType(updates.type);
    }
    if (updates.current !== undefined) dbUpdates.current = updates.current;
    if (updates.target !== undefined) dbUpdates.target = updates.target;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline || null;
    if (updates.monthlyTarget !== undefined) dbUpdates.monthly_target = updates.monthlyTarget;

    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const { error } = await supabase
        .from('goals')
        // @ts-ignore - Supabase types don't infer properly when not configured
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating goal:', error);
        return;
      }
    }

    setGoals(prev => 
      prev.map(g => {
        if (g.id !== id) return g;
        const updated = { ...g, ...updates };
        if (updates.type && updates.type !== g.type) {
          updated.color = getColorForType(updates.type);
        }
        return updated;
      })
    );
  }, [isSupabaseEnabled, user]);

  const deleteGoal = useCallback(async (id: number) => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting goal:', error);
        return;
      }
    }
    setGoals(prev => prev.filter(g => g.id !== id));
  }, [isSupabaseEnabled, user]);

  const addContribution = useCallback(async (id: number, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newCurrent = goal.current + amount;
    await updateGoal(id, { current: newCurrent });
  }, [goals, updateGoal]);

  const clearAll = useCallback(async () => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing goals:', error);
        return;
      }
    }
    setGoals([]);
    localStorage.removeItem(storageKey);
  }, [storageKey, isSupabaseEnabled, user]);

  const importGoals = useCallback(async (newGoals: Goal[]) => {
    if (isSupabaseEnabled && user?.id && user.id !== 'local') {
      const toInsert: DbGoalInsert[] = newGoals.map(g => ({
        user_id: user.id,
        name: g.name,
        type: g.type,
        current: g.current,
        target: g.target,
        deadline: g.deadline || null,
        monthly_target: g.monthlyTarget,
        color: g.color || getColorForType(g.type),
      }));

      const { data, error } = await supabase
        .from('goals')
        .insert(toInsert as any)
        .select();

      if (error) {
        console.error('Error importing goals:', error);
        return;
      }

      if (data) {
        const typedData = data as unknown as DbGoal[];
        const imported: Goal[] = typedData.map(g => ({
          id: g.id,
          name: g.name,
          type: g.type as Goal['type'],
          current: Number(g.current),
          target: Number(g.target),
          deadline: g.deadline || '',
          monthlyTarget: Number(g.monthly_target),
          color: g.color,
        }));
        setGoals(prev => [...imported, ...prev]);
      }
    } else {
      setGoals(prev => [...newGoals, ...prev]);
    }
  }, [isSupabaseEnabled, user]);

  // Computed values
  const totals = useMemo(() => {
    const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
    const overallProgress = totalTarget > 0 
      ? Math.round((totalSaved / totalTarget) * 100) 
      : 0;
    const monthlyRequired = goals.reduce((sum, g) => sum + g.monthlyTarget, 0);
    
    return { totalSaved, totalTarget, overallProgress, monthlyRequired };
  }, [goals]);

  const completedGoals = useMemo(() => 
    goals.filter(g => g.current >= g.target), 
  [goals]);

  const activeGoals = useMemo(() => 
    goals.filter(g => g.current < g.target), 
  [goals]);

  return {
    goals,
    setGoals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    clearAll,
    importGoals,
    totals,
    completedGoals,
    activeGoals,
    storageKey,
  };
}
