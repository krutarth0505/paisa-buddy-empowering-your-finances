import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useBudgets } from "@/hooks/useBudgets";
import { TRANSACTION_CATEGORIES } from "@/types";
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Film,
  Smartphone,
  Heart,
  MoreHorizontal,
  Edit2,
  Trash2,
  PiggyBank,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ReactNode> = {
  "Food & Dining": <Utensils className="w-5 h-5" />,
  "Shopping": <ShoppingCart className="w-5 h-5" />,
  "Housing": <Home className="w-5 h-5" />,
  "Transport": <Car className="w-5 h-5" />,
  "Entertainment": <Film className="w-5 h-5" />,
  "Bills & Utilities": <Smartphone className="w-5 h-5" />,
  "Healthcare": <Heart className="w-5 h-5" />,
  "Other": <MoreHorizontal className="w-5 h-5" />,
};

const Budget = () => {
  const {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    totals,
    overBudget,
    nearLimit,
    isLoading,
  } = useBudgets();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    period: "monthly" as "monthly" | "weekly",
  });

  const resetForm = () => {
    setFormData({ category: "", limit: "", period: "monthly" });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (budget: typeof budgets[0]) => {
    setFormData({
      category: budget.category,
      limit: String(budget.limit),
      period: budget.period,
    });
    setEditingId(budget.id);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const limitValue = Number(formData.limit);
    if (!formData.category || isNaN(limitValue) || limitValue <= 0) {
      toast.error("Please enter a valid category and limit");
      return;
    }

    if (editingId) {
      updateBudget(editingId, {
        category: formData.category,
        limit: limitValue,
        period: formData.period,
      });
      toast.success("Budget updated");
    } else {
      // Check if category already exists
      if (budgets.some(b => b.category === formData.category)) {
        toast.error("Budget for this category already exists");
        return;
      }
      addBudget({
        category: formData.category,
        limit: limitValue,
        period: formData.period,
      });
      toast.success("Budget added");
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this budget?")) {
      deleteBudget(id);
      toast.success("Budget deleted");
    }
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percent = (spent / limit) * 100;
    if (percent >= 100) return "bg-destructive";
    if (percent >= 80) return "bg-warning";
    return "bg-primary";
  };

  const getStatusBadge = (spent: number, limit: number) => {
    const percent = (spent / limit) * 100;
    if (percent >= 100) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
          Over Budget
        </span>
      );
    }
    if (percent >= 80) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
          Near Limit
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
        On Track
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="grid sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-muted rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Budget Tracker
              </h1>
              <p className="text-muted-foreground">
                Set spending limits and track your expenses
              </p>
            </div>
            <Button variant="hero" onClick={handleOpenAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{totals.totalLimit.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Spent This Month</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{totals.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      totals.remaining >= 0 ? "text-success" : "text-destructive"
                    )}>
                      ₹{Math.abs(totals.remaining).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                    <PiggyBank className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Used</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      totals.percentUsed >= 100 ? "text-destructive" :
                      totals.percentUsed >= 80 ? "text-warning" : "text-foreground"
                    )}>
                      {totals.percentUsed}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                    {totals.percentUsed >= 80 ? (
                      <AlertTriangle className="w-6 h-6 text-warning" />
                    ) : (
                      <TrendingUp className="w-6 h-6 text-warning" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {overBudget.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Over Budget Alert</p>
                    <p className="text-sm text-muted-foreground">
                      {overBudget.map(b => b.category).join(", ")} exceeded the budget limit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {nearLimit.length > 0 && (
            <Card className="border-warning/50 bg-warning/5 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <div>
                    <p className="font-medium text-warning">Approaching Limit</p>
                    <p className="text-sm text-muted-foreground">
                      {nearLimit.map(b => b.category).join(", ")} is nearing the budget limit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget List */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Category Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No budgets set yet</p>
                  <Button variant="outline" onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Budget
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget) => {
                    const percent = Math.min(100, (budget.spent / budget.limit) * 100);
                    
                    return (
                      <div
                        key={budget.id}
                        className="p-4 rounded-xl bg-muted/50 border border-border/50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                              {categoryIcons[budget.category] || <MoreHorizontal className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{budget.category}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {budget.period} budget
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(budget.spent, budget.limit)}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenEdit(budget)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(budget.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              ₹{budget.spent.toLocaleString()} spent
                            </span>
                            <span className="font-medium">
                              ₹{budget.limit.toLocaleString()} limit
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                getProgressColor(budget.spent, budget.limit)
                              )}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-right">
                            {budget.limit - budget.spent > 0 ? (
                              <>₹{(budget.limit - budget.spent).toLocaleString()} remaining</>
                            ) : (
                              <>₹{Math.abs(budget.limit - budget.spent).toLocaleString()} over</>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Budget" : "Add Budget"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                disabled={!!editingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_CATEGORIES.filter(c => c !== "Income").map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget Limit (₹)</Label>
              <Input
                type="number"
                value={formData.limit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, limit: e.target.value }))
                }
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select
                value={formData.period}
                onValueChange={(value: "monthly" | "weekly") =>
                  setFormData((prev) => ({ ...prev, period: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleSubmit}>
              {editingId ? "Update" : "Add"} Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budget;
