import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CalendarClock, Repeat, AlertCircle, ChevronRight } from "lucide-react";
import type { RecurringPattern } from "@/hooks/useRecurringTransactions";

interface RecurringTransactionsProps {
  patterns: RecurringPattern[];
  monthlyTotal: number;
  upcomingThisWeek: RecurringPattern[];
}

const frequencyLabels: Record<RecurringPattern["frequency"], string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const frequencyColors: Record<RecurringPattern["frequency"], string> = {
  weekly: "bg-blue-500/10 text-blue-500",
  monthly: "bg-primary/10 text-primary",
  quarterly: "bg-amber-500/10 text-amber-500",
  yearly: "bg-purple-500/10 text-purple-500",
};

export default function RecurringTransactions({
  patterns,
  monthlyTotal,
  upcomingThisWeek,
}: RecurringTransactionsProps) {
  const displayPatterns = patterns.slice(0, 5);

  if (patterns.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Repeat className="w-5 h-5 text-primary" />
            Recurring Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No recurring patterns detected yet.</p>
            <p className="text-sm mt-1">Add more transactions to see recurring expenses.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Repeat className="w-5 h-5 text-primary" />
          Recurring Expenses
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Card */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Est. Monthly Recurring</p>
              <p className="text-2xl font-bold text-foreground">₹{monthlyTotal.toLocaleString("en-IN")}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{patterns.length} recurring</p>
              <p className="text-xs text-primary">{upcomingThisWeek.length} due this week</p>
            </div>
          </div>
        </div>

        {/* Upcoming Alert */}
        {upcomingThisWeek.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Upcoming This Week</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {upcomingThisWeek.map((p) => p.name).join(", ")} (₹
                {upcomingThisWeek.reduce((s, p) => s + p.amount, 0).toLocaleString("en-IN")})
              </p>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {displayPatterns.map((pattern, idx) => (
            <div
              key={`${pattern.name}-${idx}`}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{pattern.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-xs ${frequencyColors[pattern.frequency]}`}>
                      {frequencyLabels[pattern.frequency]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Next: {new Date(pattern.nextExpectedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
              <p className="font-semibold text-foreground">₹{pattern.amount.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        {patterns.length > 5 && (
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/transactions" className="flex items-center justify-center gap-1">
              View all {patterns.length} recurring expenses
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
