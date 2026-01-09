// Centralized TypeScript types for Paisa Buddy

export type TransactionType = "Essentials" | "Needs" | "Wants" | "Income";

export interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number; // negative = expense, positive = income
  date: string;
  type: TransactionType;
}

export type GoalType = "Emergency" | "Vacation" | "Education" | "Home" | "Vehicle" | "Other";

export interface Goal {
  id: number;
  name: string;
  type: GoalType;
  current: number;
  target: number;
  deadline: string;
  monthlyTarget: number;
  color: string;
}

export interface Budget {
  id: number;
  category: string;
  limit: number;
  spent: number;
  period: "monthly" | "weekly";
}

export interface User {
  id?: string;
  name: string;
  email: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface UserSettings {
  currency: "INR" | "USD" | "EUR" | "GBP";
  currencySymbol: string;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  notifications: boolean;
  weeklyReport: boolean;
  budgetAlerts: boolean;
}

// Category constants
export const TRANSACTION_CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Housing",
  "Transport",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Income",
  "Other",
] as const;

export const GOAL_TYPES: GoalType[] = [
  "Emergency",
  "Vacation",
  "Education",
  "Home",
  "Vehicle",
  "Other",
];

// Utility type for category
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];
