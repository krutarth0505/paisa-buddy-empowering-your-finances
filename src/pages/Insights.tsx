import { useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useBudgets } from "@/hooks/useBudgets";
import {
  generateFinancialInsights,
  getLocalInsights,
  isAIConfigured,
  type FinancialSnapshot,
  type AIInsight,
} from "@/lib/ai-service";
import { 
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  PiggyBank,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const quickActions = [
  { label: "Set Budget Alert", icon: AlertTriangle, href: "/budget" },
  { label: "Review Goals", icon: Target, href: "/goals" },
  { label: "Add Transaction", icon: CreditCard, href: "/transactions" },
  { label: "View Settings", icon: PiggyBank, href: "/settings" },
];

const parseDate = (raw: string) => {
  if (!raw) return new Date();
  // Support dd-mm-yyyy and yyyy-mm-dd
  const parts = raw.includes("-") ? raw.split("-") : raw.split("/");
  if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
    const [dd, mm, yyyy] = parts;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!Number.isNaN(d.getTime())) return d;
  }
  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
};

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const Insights = () => {
  const { transactions, isLoading: loadingTx } = useTransactions();
  const { goals } = useGoals();
  const { budgets } = useBudgets();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [aiState, setAiState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [aiError, setAiError] = useState("");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const net = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;
    return { income, expenses, net, savingsRate };
  }, [transactions]);

  const weeklySpending = useMemo(() => {
    const now = new Date();
    const last30 = transactions.filter((t) => {
      const d = parseDate(t.date);
      return now.getTime() - d.getTime() <= 30 * 24 * 60 * 60 * 1000;
    });
    const buckets: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    last30.forEach((t) => {
      if (t.amount < 0) {
        const d = parseDate(t.date);
        const day = d.toLocaleDateString("en-US", { weekday: "short" });
        buckets[day] = (buckets[day] || 0) + Math.abs(t.amount);
      }
    });
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({ day, amount: buckets[day] || 0 }));
  }, [transactions]);

  const monthlyNet = useMemo(() => {
    const grouped: Record<string, { month: string; actual: number; projected?: number | null }> = {};
    transactions.forEach((t) => {
      const d = parseDate(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = { month: key, actual: 0, projected: null };
      grouped[key].actual += t.amount;
    });

    const sortedKeys = Object.keys(grouped).sort();
    const actualData = sortedKeys.map((key) => ({
      month: key,
      actual: grouped[key].actual,
      projected: null,
    }));

    const recent = actualData.slice(-3);
    const avgNet = recent.length ? recent.reduce((s, r) => s + r.actual, 0) / recent.length : 0;
    const next1 = new Date();
    next1.setMonth(next1.getMonth() + 1);
    const next2 = new Date();
    next2.setMonth(next2.getMonth() + 2);
    const monthLabel = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const projected = avgNet !== 0 ? [
      { month: monthLabel(next1), actual: null, projected: avgNet },
      { month: monthLabel(next2), actual: null, projected: avgNet },
    ] : [];

    return [...actualData, ...projected];
  }, [transactions]);

  const highestCategory = useMemo(() => {
    const buckets: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.amount < 0) {
        buckets[t.category || "Other"] = (buckets[t.category || "Other"] || 0) + Math.abs(t.amount);
      }
    });
    const entries = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
    return entries[0] ? { category: entries[0][0], amount: entries[0][1] } : null;
  }, [transactions]);

  const topDay = useMemo(() => {
    const entries = weeklySpending.slice().sort((a, b) => b.amount - a.amount);
    return entries[0]?.amount ? entries[0] : null;
  }, [weeklySpending]);

  // Build financial snapshot for AI
  const financialSnapshot: FinancialSnapshot = useMemo(() => ({
    totals,
    highestCategory,
    topDay,
    recent: transactions.slice(0, 20).map((tx) => ({
      name: tx.name,
      category: tx.category,
      amount: tx.amount,
      date: tx.date,
    })),
    goals: goals.map(g => ({
      name: g.name,
      current: g.current,
      target: g.target,
      progress: g.target > 0 ? Math.round((g.current / g.target) * 100) : 0,
    })),
    budgets: budgets.map(b => ({
      category: b.category,
      limit: b.limit,
      spent: b.spent,
      percentUsed: b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0,
    })),
  }), [transactions, totals, highestCategory, topDay, goals, budgets]);

  // Local insights (no API needed)
  const localInsights = useMemo(() => 
    getLocalInsights(financialSnapshot),
  [financialSnapshot]);

  const handleGenerateAI = async () => {
    console.log("Generate AI clicked!");
    console.log("isAIConfigured:", isAIConfigured());
    console.log("transactions.length:", transactions.length);
    
    if (!isAIConfigured()) {
      setAiState("error");
      setAiError("Add VITE_OPENROUTER_API_KEY to your .env file to enable AI insights.");
      return;
    }

    if (!transactions.length) {
      setAiState("error");
      setAiError("Add some transactions first to get AI-powered insights.");
      return;
    }

    try {
      setAiState("loading");
      setAiError("");
      const insight = await generateFinancialInsights(financialSnapshot);
      setAiInsight(insight);
      setAiState("ready");
    } catch (error) {
      console.error("AI insight error:", error);
      setAiState("error");
      setAiError(error instanceof Error ? error.message : "Failed to generate insights. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                AI Insights
              </h1>
              <p className="text-muted-foreground">Personalized financial recommendations</p>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Insights
            </Button>
          </div>

          {/* AI Summary Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">Financial Overview</h2>
                  {transactions.length ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground leading-relaxed">
                        Net this period: <span className={totals.net >= 0 ? "text-success font-medium" : "text-destructive font-medium"}>{formatCurrency(totals.net)}</span>
                        {" • "}Savings rate <span className={totals.savingsRate >= 20 ? "text-success font-medium" : "text-warning font-medium"}>{totals.savingsRate}%</span>
                        {highestCategory && (
                          <> • Top spend: <span className="text-foreground font-medium">{highestCategory.category}</span></>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {quickActions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <Button key={action.label} variant="outline" size="sm" className="bg-background/50" asChild>
                              <a href={action.href}>
                                <Icon className="w-4 h-4 mr-2" />
                                {action.label}
                              </a>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Add or import transactions to see your financial overview.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          {localInsights.length > 0 && (
            <Card className="border-border/50 mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-warning" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {localInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Lightbulb className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* AI-Powered Insights */}
          <Card className="border-border/50 mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI-Powered Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAIConfigured() 
                    ? "Get personalized insights powered by AI" 
                    : "Add VITE_OPENROUTER_API_KEY to enable AI features"}
                </p>
              </div>
              <Button 
                onClick={handleGenerateAI} 
                disabled={aiState === "loading" || !transactions.length}
                variant={isAIConfigured() ? "default" : "outline"}
              >
                {aiState === "loading" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {aiState === "loading" ? "Analyzing..." : "Generate Insights"}
              </Button>
            </CardHeader>
            <CardContent>
              {aiState === "ready" && aiInsight ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Summary
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight.summary}</p>
                  </div>

                  {/* Recommendations */}
                  {aiInsight.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {aiInsight.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                            <ArrowRight className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {aiInsight.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Watch Out For
                      </h4>
                      <ul className="space-y-2">
                        {aiInsight.warnings.map((warning, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                            <XCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Opportunities */}
                  {aiInsight.opportunities.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        Opportunities
                      </h4>
                      <ul className="space-y-2">
                        {aiInsight.opportunities.map((opp, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                            <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : aiState === "error" ? (
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {aiError}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {transactions.length 
                      ? "Click 'Generate Insights' to get AI-powered financial analysis" 
                      : "Add transactions to unlock AI insights"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Spending */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-accent" />
                  Weekly Spending Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length ? (
                  <>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklySpending}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [`₹${Math.round(value).toLocaleString()}`, 'Spent']}
                          />
                          <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      {topDay ? `${topDay.day} is your highest spending day: ${formatCurrency(topDay.amount)}` : "Spending data will appear as you add expenses."}
                    </p>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    Import transactions to view weekly spending.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Savings Projection */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Savings Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyNet.length ? (
                  <>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyNet}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${Math.round(v/1000)}k`} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number | null) => value !== null ? [`₹${Math.round(value).toLocaleString()}`, ''] : ['-', '']}
                          />
                          <Line type="monotone" dataKey="actual" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: 'hsl(var(--success))' }} name="Actual" />
                          <Line type="monotone" dataKey="projected" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Projected" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Projection uses your recent average net cash flow.
                    </p>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    Add transactions to generate a projection.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;
