import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search,
  Filter,
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Film,
  Smartphone,
  Heart,
  MoreHorizontal,
  Download,
  Upload,
  Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

const categoryIcons: { [key: string]: React.ReactNode } = {
  "Food & Dining": <Utensils className="w-5 h-5" />,
  "Shopping": <ShoppingCart className="w-5 h-5" />,
  "Housing": <Home className="w-5 h-5" />,
  "Transport": <Car className="w-5 h-5" />,
  "Entertainment": <Film className="w-5 h-5" />,
  "Bills & Utilities": <Smartphone className="w-5 h-5" />,
  "Healthcare": <Heart className="w-5 h-5" />,
  "Income": <TrendingUp className="w-5 h-5" />,
  "Other": <MoreHorizontal className="w-5 h-5" />,
};

type Transaction = {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
  type: "Essentials" | "Needs" | "Wants" | "Income";
};

const demoTransactions: Transaction[] = [
  { id: 1, name: "Swiggy Order", category: "Food & Dining", amount: -485, date: "Dec 30, 2024", type: "Wants" },
  { id: 2, name: "Monthly Salary", category: "Income", amount: 52000, date: "Dec 29, 2024", type: "Income" },
  { id: 3, name: "Electricity Bill", category: "Bills & Utilities", amount: -1850, date: "Dec 28, 2024", type: "Essentials" },
  { id: 4, name: "Amazon Shopping", category: "Shopping", amount: -2999, date: "Dec 27, 2024", type: "Wants" },
  { id: 5, name: "Petrol", category: "Transport", amount: -1200, date: "Dec 26, 2024", type: "Needs" },
  { id: 6, name: "Rent Payment", category: "Housing", amount: -15000, date: "Dec 25, 2024", type: "Essentials" },
  { id: 7, name: "Netflix Subscription", category: "Entertainment", amount: -649, date: "Dec 24, 2024", type: "Wants" },
  { id: 8, name: "Grocery - BigBasket", category: "Food & Dining", amount: -2340, date: "Dec 23, 2024", type: "Essentials" },
  { id: 9, name: "Doctor Visit", category: "Healthcare", amount: -800, date: "Dec 22, 2024", type: "Needs" },
  { id: 10, name: "Freelance Payment", category: "Income", amount: 15000, date: "Dec 21, 2024", type: "Income" },
];

const typeColors: { [key: string]: string } = {
  "Essentials": "bg-primary/10 text-primary",
  "Needs": "bg-accent/10 text-accent",
  "Wants": "bg-warning/10 text-warning",
  "Income": "bg-success/10 text-success",
};

const Transactions = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [transactionsData, setTransactionsData] = useState<Transaction[]>(user ? [] : demoTransactions);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    name: "",
    category: "Other",
    amount: "",
    date: "",
    type: "Essentials" as Transaction["type"],
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const exportLinkRef = useRef<HTMLAnchorElement | null>(null);
  const storageKey = user ? `pb-transactions-${user.email}` : "pb-transactions-guest";

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setTransactionsData(JSON.parse(saved));
        } catch {
          setTransactionsData([]);
        }
      } else {
        setTransactionsData([]);
      }
    } else {
      setTransactionsData(demoTransactions);
    }
    setSearchQuery("");
    setActiveFilter("All");
  }, [user, storageKey]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(storageKey, JSON.stringify(transactionsData));
    }
  }, [transactionsData, storageKey, user]);

  const filters = ["All", "Essentials", "Needs", "Wants", "Income"];

  const filteredTransactions = transactionsData.filter((tx) => {
    const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || tx.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const summaryTotals = useMemo(() => {
    const totals: Record<"Essentials" | "Needs" | "Wants" | "Income", number> = {
      Essentials: 0,
      Needs: 0,
      Wants: 0,
      Income: 0,
    };
    transactionsData.forEach((tx) => {
      if (totals[tx.type] !== undefined) {
        totals[tx.type] += Math.abs(tx.amount);
      }
    });
    return totals;
  }, [transactionsData]);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleClearAll = () => {
    setTransactionsData([]);
    localStorage.removeItem(storageKey);
    toast.success("All transactions deleted");
  };

  // Smart category detection from transaction name
  const detectCategory = (name: string, amount: number): { category: string; type: Transaction["type"] } => {
    const lower = name.toLowerCase();
    
    // Food & Dining
    if (/swiggy|zomato|blinkit|bigbasket|zepto|dunzo|grofers|instamart|food|restaurant|hotel|cafe|pizza|dominos|mcdonalds|kfc|burger|biryani|idli|dosa|rasoi|dhaba|canteen|mess|tiffin|kitchen|bakery|sweet|milk|grocery|vegetables|fruits|meat|chicken|mutton|fish/.test(lower)) {
      return { category: "Food & Dining", type: amount >= 0 ? "Income" : "Essentials" };
    }
    
    // Transport
    if (/irctc|railway|railways|metro|uber|ola|rapido|petrol|diesel|fuel|parking|toll|fastag|bus|cab|taxi|auto|rickshaw|flight|airline|indigo|spicejet|vistara|airindia/.test(lower)) {
      return { category: "Transport", type: amount >= 0 ? "Income" : "Needs" };
    }
    
    // Shopping
    if (/amazon|flipkart|myntra|ajio|meesho|shopsy|nykaa|tata.*cliq|croma|reliance|dmart|mall|mart|store|shop|retail|fashion|clothes|electronics|mobile|phone|laptop|gadget|appliance/.test(lower)) {
      return { category: "Shopping", type: amount >= 0 ? "Income" : "Wants" };
    }
    
    // Entertainment & Subscriptions
    if (/netflix|spotify|prime|hotstar|disney|youtube|zee5|sonyliv|jiocinema|gaana|wynk|apple.*music|gaming|game|movie|cinema|pvr|inox|multiplex|concert|event|ticket/.test(lower)) {
      return { category: "Entertainment", type: amount >= 0 ? "Income" : "Wants" };
    }
    
    // Bills & Utilities
    if (/electricity|electric|power|water|gas|internet|broadband|wifi|jio|airtel|vodafone|vi|bsnl|tata.*sky|dish|dth|recharge|postpaid|prepaid|bill|utility/.test(lower)) {
      return { category: "Bills & Utilities", type: amount >= 0 ? "Income" : "Essentials" };
    }
    
    // Healthcare
    if (/medical|medicine|pharmacy|hospital|doctor|clinic|health|apollo|medplus|netmeds|pharmeasy|1mg|diagnostic|lab|test|scan|xray|consultation|dentist|eye/.test(lower)) {
      return { category: "Healthcare", type: amount >= 0 ? "Income" : "Needs" };
    }
    
    // Investment & Finance
    if (/mutual.*fund|mf|sip|iccl|grow|zerodha|upstox|angel|paytm.*money|kuvera|coin|ipo|nps|ppf|fd|fixed.*deposit|rd|recurring|lum.*sum|investment|trading|stock|share|demat/.test(lower)) {
      return { category: "Investment", type: amount >= 0 ? "Income" : "Essentials" };
    }
    
    // Transfers (UPI to person names - usually personal transfers)
    if (/^upi\s+[a-z]+\s+[a-z]+/.test(lower) && !/bank|ltd|pvt|india|service|store|shop|medical|hotel|restaurant/.test(lower)) {
      if (amount >= 0) {
        return { category: "Income", type: "Income" };
      }
      return { category: "Transfer", type: "Needs" };
    }
    
    // Salary / Income patterns
    if (/salary|credit.*ach|neft.*credit|imps.*credit|bonus|incentive|reimbursement|refund/.test(lower)) {
      return { category: "Income", type: "Income" };
    }
    
    // Default
    if (amount >= 0) {
      return { category: "Income", type: "Income" };
    }
    return { category: "Other", type: "Essentials" };
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      if (!lines.length) throw new Error("Empty file");

      const parseLine = (line: string) =>
        line.match(/("([^"]|"")*"|[^,]+)/g)?.map((cell) =>
          cell.replace(/^"|"$/g, "").replace(/""/g, "").trim()
        ) ?? [];

      const headerCells = parseLine(lines[0]);
      const header = headerCells.map((h) => h.toLowerCase());

      const requiredStandard = ["name", "category", "amount", "date", "type"];
      const isStandard = requiredStandard.every((key) => header.includes(key));

      // Bank export detection - supports multiple formats:
      // 1. Date, Particulars, Debit, Credit, Balance
      // 2. Date, Particulars, Amount, Balance (like user's CSV)
      const isBankExport = header.includes("particulars") && (
        header.includes("debit") || 
        header.includes("credit") || 
        header.includes("amount")
      );

      const dataLines = (isStandard || isBankExport) ? lines.slice(1) : lines;

      const getValue = (cells: string[], key: string, idxFallback: number) => {
        if (isStandard || isBankExport) {
          const headerIndex = header.indexOf(key);
          if (headerIndex >= 0) return cells[headerIndex] ?? "";
          // Fallback to positional map for bank exports if headers are slightly off
          if (isBankExport) {
            const bankPositions: Record<string, number> = {
              date: 0,
              particulars: 1,
              debit: 2,
              credit: 3,
              balance: 4,
            };
            if (bankPositions[key] !== undefined) return cells[bankPositions[key]] ?? "";
          }
        }
        return cells[idxFallback] ?? "";
      };

      const normalized: Transaction[] = dataLines.map((line, idx) => {
        const cells = parseLine(line);

        if (isBankExport) {
          const particulars = getValue(cells, "particulars", 1);
          const debitRaw = getValue(cells, "debit", 2);
          const creditRaw = getValue(cells, "credit", 3);
          const amountRaw = getValue(cells, "amount", 2); // For CSV with single Amount column
          const dateRaw = getValue(cells, "date", 0);

          const parseAmount = (val: string) => {
            const cleaned = String(val).replace(/[\s,\u00A0]/g, "").replace(/[^0-9.\-]/g, "");
            const n = Number.parseFloat(cleaned);
            return Number.isFinite(n) ? n : 0;
          };

          const debit = parseAmount(debitRaw);
          const credit = parseAmount(creditRaw);
          
          let amount = 0;
          // Check if there's a single Amount column (like in the user's CSV)
          if (header.includes("amount") && amountRaw) {
            amount = parseAmount(amountRaw);
          } else if (debit && !credit) {
            amount = -Math.abs(debit);
          } else if (credit && !debit) {
            amount = Math.abs(credit);
          } else {
            amount = credit - debit;
          }

          // Use smart category detection
          const detected = detectCategory(particulars, amount);

          return {
            id: idx + 1,
            name: particulars || `Transaction ${idx + 1}`,
            category: detected.category,
            amount,
            date: dateRaw || new Date().toISOString().slice(0, 10),
            type: detected.type,
          };
        }

        return {
          id: idx + 1,
          name: getValue(cells, "name", 0) || `Transaction ${idx + 1}`,
          category: getValue(cells, "category", 1) || "Other",
          amount: Number(getValue(cells, "amount", 2)) || 0,
          date: getValue(cells, "date", 3) || new Date().toDateString(),
          type: (getValue(cells, "type", 4) as Transaction["type"]) || "Essentials",
        };
      });

      setTransactionsData(normalized);
      toast.success(`Imported ${normalized.length} transactions from CSV`);
    } catch (error) {
      toast.error("Upload a CSV with columns: name, category, amount, date, type OR a bank export with Date, Particulars, Amount/Debit/Credit");
    } finally {
      event.target.value = "";
    }
  };

  const resetTransactionForm = () =>
    setNewTransaction({ name: "", category: "Other", amount: "", date: "", type: "Essentials" });

  const handleAddTransaction = () => {
    const amountValue = Number(newTransaction.amount);
    if (!newTransaction.name || Number.isNaN(amountValue)) {
      toast.error("Enter a name and valid amount.");
      return;
    }

    const next: Transaction = {
      id: transactionsData.length ? Math.max(...transactionsData.map((t) => t.id)) + 1 : 1,
      name: newTransaction.name,
      category: newTransaction.category || "Other",
      amount: amountValue,
      date: newTransaction.date || new Date().toDateString(),
      type: newTransaction.type,
    };
    setTransactionsData((prev) => [...prev, next]);
    toast.success("Transaction added");
    resetTransactionForm();
    setAddDialogOpen(false);
  };

  const handleExport = (format: "json" | "csv") => {
    if (!transactionsData.length) {
      toast("No transactions to export.");
      return;
    }

    if (format === "json") {
      const blob = new Blob([JSON.stringify(transactionsData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = exportLinkRef.current;
      if (link) {
        link.href = url;
        link.download = "transactions.json";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
      return;
    }

    // CSV
    const header = ["id", "name", "category", "amount", "date", "type"];
    const rows = transactionsData.map((tx) => [tx.id, tx.name, tx.category, tx.amount, tx.date, tx.type]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = exportLinkRef.current;
    if (link) {
      link.href = url;
      link.download = "transactions.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Transactions
              </h1>
              <p className="text-muted-foreground">Track and manage your expenses</p>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleClearAll}>
                Clear All
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleImportClick}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="hero" size="sm" onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className="whitespace-nowrap"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Essentials</p>
                <p className="text-lg font-bold text-primary">₹{summaryTotals.Essentials.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Needs</p>
                <p className="text-lg font-bold text-accent">₹{summaryTotals.Needs.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Wants</p>
                <p className="text-lg font-bold text-warning">₹{summaryTotals.Wants.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Income</p>
                <p className="text-lg font-bold text-success">₹{summaryTotals.Income.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {activeFilter === "All" ? "All Transactions" : `${activeFilter} Transactions`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        tx.amount > 0 ? 'bg-success/10' : 'bg-muted'
                      }`}>
                        {tx.amount > 0 ? (
                          <TrendingUp className="w-5 h-5 text-success" />
                        ) : (
                          categoryIcons[tx.category] || <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{tx.category}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{tx.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[tx.type]}`}>
                        {tx.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">No transactions yet. Upload a CSV file or add one manually to get started.</p>
                  <Button variant="outline" size="sm" onClick={handleImportClick}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Transactions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <a ref={exportLinkRef} className="hidden" aria-hidden />
        </div>
      </main>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="tx-name">Name</Label>
              <Input
                id="tx-name"
                value={newTransaction.name}
                onChange={(e) => setNewTransaction((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Grocery run"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tx-amount">Amount (use negative for expense)</Label>
              <Input
                id="tx-amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="-1200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tx-category">Category</Label>
              <Input
                id="tx-category"
                value={newTransaction.category}
                onChange={(e) => setNewTransaction((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Food & Dining"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tx-date">Date</Label>
              <Input
                id="tx-date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tx-type">Type</Label>
              <select
                id="tx-type"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={newTransaction.type}
                onChange={(e) =>
                  setNewTransaction((prev) => ({ ...prev, type: e.target.value as Transaction["type"] }))
                }
              >
                <option value="Essentials">Essentials</option>
                <option value="Needs">Needs</option>
                <option value="Wants">Wants</option>
                <option value="Income">Income</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { resetTransactionForm(); setAddDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
