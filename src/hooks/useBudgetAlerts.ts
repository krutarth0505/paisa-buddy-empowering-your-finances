import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import type { Budget } from "@/types";

export interface BudgetAlert {
  category: string;
  limit: number;
  spent: number;
  percentUsed: number;
  type: "warning" | "exceeded" | "critical";
}

interface UseBudgetAlertsOptions {
  enabled?: boolean;
  warningThreshold?: number;  // default 80%
  criticalThreshold?: number; // default 90%
}

export function useBudgetAlerts(
  budgets: Budget[],
  options: UseBudgetAlertsOptions = {}
) {
  const { 
    enabled = true, 
    warningThreshold = 80,
    criticalThreshold = 90 
  } = options;
  
  // Track which alerts we've already shown to avoid duplicates
  const shownAlertsRef = useRef<Set<string>>(new Set());
  const isFirstRender = useRef(true);

  const getAlerts = (): BudgetAlert[] => {
    return budgets
      .filter(b => b.limit > 0)
      .map(b => {
        const percentUsed = Math.round((b.spent / b.limit) * 100);
        let type: BudgetAlert["type"] | null = null;

        if (percentUsed >= 100) {
          type = "exceeded";
        } else if (percentUsed >= criticalThreshold) {
          type = "critical";
        } else if (percentUsed >= warningThreshold) {
          type = "warning";
        }

        if (type) {
          return {
            category: b.category,
            limit: b.limit,
            spent: b.spent,
            percentUsed,
            type,
          };
        }
        return null;
      })
      .filter((a): a is BudgetAlert => a !== null);
  };

  useEffect(() => {
    if (!enabled || budgets.length === 0) return;

    // Skip first render to avoid showing alerts on page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Pre-populate shown alerts with current state
      budgets.forEach(b => {
        const percent = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
        if (percent >= warningThreshold) {
          shownAlertsRef.current.add(`${b.category}-warning`);
        }
        if (percent >= criticalThreshold) {
          shownAlertsRef.current.add(`${b.category}-critical`);
        }
        if (percent >= 100) {
          shownAlertsRef.current.add(`${b.category}-exceeded`);
        }
      });
      return;
    }

    budgets.forEach(b => {
      if (b.limit <= 0) return;
      const percent = Math.round((b.spent / b.limit) * 100);
      const remaining = b.limit - b.spent;

      // Budget exceeded (100%+)
      if (percent >= 100 && !shownAlertsRef.current.has(`${b.category}-exceeded`)) {
        shownAlertsRef.current.add(`${b.category}-exceeded`);
        toast.error(`${b.category} budget exceeded!`, {
          description: `You've spent ₹${b.spent.toLocaleString('en-IN')} of ₹${b.limit.toLocaleString('en-IN')} budget.`,
          duration: 6000,
        });
      }
      // Critical alert (90%+)
      else if (percent >= criticalThreshold && percent < 100 && !shownAlertsRef.current.has(`${b.category}-critical`)) {
        shownAlertsRef.current.add(`${b.category}-critical`);
        toast.warning(`${b.category} at ${percent}%!`, {
          description: `Only ₹${remaining.toLocaleString('en-IN')} left in this budget.`,
          duration: 5000,
        });
      }
      // Warning alert (80%+)
      else if (percent >= warningThreshold && percent < criticalThreshold && !shownAlertsRef.current.has(`${b.category}-warning`)) {
        shownAlertsRef.current.add(`${b.category}-warning`);
        toast(`${b.category} at ${percent}%`, {
          description: `₹${remaining.toLocaleString('en-IN')} remaining this month.`,
          duration: 4000,
        });
      }
    });
  }, [budgets, enabled, warningThreshold, criticalThreshold]);

  // Reset alerts at the start of a new month
  useEffect(() => {
    const checkNewMonth = () => {
      const lastCheck = localStorage.getItem('pb-budget-alerts-month');
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      if (lastCheck !== currentMonth) {
        localStorage.setItem('pb-budget-alerts-month', currentMonth);
        shownAlertsRef.current.clear();
        isFirstRender.current = true;
      }
    };

    checkNewMonth();
    const interval = setInterval(checkNewMonth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return {
    alerts: getAlerts(),
    exceededBudgets: getAlerts().filter(a => a.type === "exceeded"),
    warningBudgets: getAlerts().filter(a => a.type === "warning" || a.type === "critical"),
  };
}
