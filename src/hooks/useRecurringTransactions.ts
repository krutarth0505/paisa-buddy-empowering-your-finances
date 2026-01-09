import { useMemo } from "react";
import type { Transaction } from "@/types";

export interface RecurringPattern {
  name: string;
  category: string;
  amount: number;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  occurrences: number;
  lastDate: string;
  nextExpectedDate: string;
  avgDaysBetween: number;
}

interface RecurringTransactionsResult {
  patterns: RecurringPattern[];
  monthlyRecurringTotal: number;
  upcomingThisWeek: RecurringPattern[];
  subscriptions: RecurringPattern[];
  bills: RecurringPattern[];
}

const SUBSCRIPTION_KEYWORDS = [
  "netflix", "spotify", "amazon prime", "hotstar", "disney", "youtube", "premium",
  "subscription", "membership", "zee5", "sonyliv", "jio", "airtel", "vodafone",
  "google one", "icloud", "adobe", "microsoft", "linkedin", "gym", "fitness",
];

const BILL_KEYWORDS = [
  "electricity", "electric", "power", "water", "gas", "internet", "broadband",
  "wifi", "phone", "mobile", "rent", "emi", "loan", "insurance", "bill",
];

const getFrequency = (avgDays: number): RecurringPattern["frequency"] => {
  if (avgDays <= 10) return "weekly";
  if (avgDays <= 40) return "monthly";
  if (avgDays <= 100) return "quarterly";
  return "yearly";
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isWithinDays = (date: Date, days: number): boolean => {
  const now = new Date();
  const futureDate = addDays(now, days);
  return date <= futureDate && date >= now;
};

export function useRecurringTransactions(transactions: Transaction[]): RecurringTransactionsResult {
  return useMemo(() => {
    if (!transactions.length) {
      return {
        patterns: [],
        monthlyRecurringTotal: 0,
        upcomingThisWeek: [],
        subscriptions: [],
        bills: [],
      };
    }

    // Group transactions by similar name and amount
    const grouped: Record<string, Transaction[]> = {};

    transactions.forEach((tx) => {
      if (tx.amount >= 0) return; // Only consider expenses

      // Normalize the name for grouping
      const normalizedName = tx.name.toLowerCase().trim();
      const key = `${normalizedName}|${Math.round(Math.abs(tx.amount) / 50) * 50}`; // Group by name and rounded amount

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(tx);
    });

    const patterns: RecurringPattern[] = [];

    Object.values(grouped).forEach((txGroup) => {
      // Need at least 2 occurrences to detect a pattern
      if (txGroup.length < 2) return;

      // Sort by date
      const sorted = [...txGroup].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate average days between transactions
      let totalDays = 0;
      for (let i = 1; i < sorted.length; i++) {
        const daysDiff =
          (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) /
          (1000 * 60 * 60 * 24);
        totalDays += daysDiff;
      }

      const avgDays = totalDays / (sorted.length - 1);

      // Check if the pattern is reasonably consistent (allow 50% variance)
      const isConsistent = sorted.length >= 2;

      if (isConsistent && avgDays >= 5 && avgDays <= 400) {
        const lastTx = sorted[sorted.length - 1];
        const avgAmount = sorted.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / sorted.length;
        const frequency = getFrequency(avgDays);
        const nextExpected = addDays(new Date(lastTx.date), avgDays);

        patterns.push({
          name: lastTx.name,
          category: lastTx.category,
          amount: Math.round(avgAmount),
          frequency,
          occurrences: sorted.length,
          lastDate: lastTx.date,
          nextExpectedDate: nextExpected.toISOString().split("T")[0],
          avgDaysBetween: Math.round(avgDays),
        });
      }
    });

    // Sort by amount (highest first)
    patterns.sort((a, b) => b.amount - a.amount);

    // Calculate monthly recurring total
    const monthlyRecurringTotal = patterns.reduce((sum, p) => {
      switch (p.frequency) {
        case "weekly":
          return sum + p.amount * 4;
        case "monthly":
          return sum + p.amount;
        case "quarterly":
          return sum + p.amount / 3;
        case "yearly":
          return sum + p.amount / 12;
        default:
          return sum;
      }
    }, 0);

    // Find upcoming payments this week
    const upcomingThisWeek = patterns.filter((p) =>
      isWithinDays(new Date(p.nextExpectedDate), 7)
    );

    // Categorize subscriptions and bills
    const subscriptions = patterns.filter((p) =>
      SUBSCRIPTION_KEYWORDS.some((keyword) => p.name.toLowerCase().includes(keyword))
    );

    const bills = patterns.filter((p) =>
      BILL_KEYWORDS.some((keyword) =>
        p.name.toLowerCase().includes(keyword) || p.category.toLowerCase().includes(keyword)
      )
    );

    return {
      patterns,
      monthlyRecurringTotal: Math.round(monthlyRecurringTotal),
      upcomingThisWeek,
      subscriptions,
      bills,
    };
  }, [transactions]);
}
