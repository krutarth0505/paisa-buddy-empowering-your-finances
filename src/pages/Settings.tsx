import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import type { UserSettings } from "@/types";
import {
  User,
  Bell,
  Globe,
  Shield,
  Download,
  Trash2,
  Save,
  Mail,
  Calendar,
} from "lucide-react";

const DEFAULT_SETTINGS: UserSettings = {
  currency: "INR",
  currencySymbol: "₹",
  dateFormat: "DD/MM/YYYY",
  notifications: true,
  weeklyReport: false,
  budgetAlerts: true,
};

const CURRENCY_OPTIONS = [
  { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
];

const Settings = () => {
  const { user, login, logout } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const settingsKey = user ? `pb-settings-${user.email}` : "pb-settings-guest";

  useEffect(() => {
    const saved = localStorage.getItem(settingsKey);
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
    setProfileName(user?.name || "");
  }, [settingsKey, user]);

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate save delay
    setTimeout(() => {
      localStorage.setItem(settingsKey, JSON.stringify(settings));
      
      // Update user name if changed
      if (user && profileName !== user.name) {
        login({ ...user, name: profileName });
      }
      
      setIsSaving(false);
      toast.success("Settings saved successfully!");
    }, 500);
  };

  const handleCurrencyChange = (value: string) => {
    const currency = CURRENCY_OPTIONS.find(c => c.value === value);
    if (currency) {
      setSettings(prev => ({
        ...prev,
        currency: value as UserSettings["currency"],
        currencySymbol: currency.symbol,
      }));
    }
  };

  const handleExportAllData = () => {
    const transactionsKey = user ? `pb-transactions-${user.email}` : "pb-transactions-guest";
    const goalsKey = user ? `pb-goals-${user.email}` : "pb-goals-guest";
    const budgetsKey = user ? `pb-budgets-${user.email}` : "pb-budgets-guest";

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: user ? { name: user.name, email: user.email } : null,
      settings,
      transactions: JSON.parse(localStorage.getItem(transactionsKey) || "[]"),
      goals: JSON.parse(localStorage.getItem(goalsKey) || "[]"),
      budgets: JSON.parse(localStorage.getItem(budgetsKey) || "[]"),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paisa-buddy-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const handleDeleteAllData = () => {
    if (!window.confirm("Are you sure? This will delete ALL your data including transactions, goals, and budgets. This cannot be undone.")) {
      return;
    }

    const keysToDelete = [
      `pb-transactions-${user?.email || "guest"}`,
      `pb-goals-${user?.email || "guest"}`,
      `pb-budgets-${user?.email || "guest"}`,
      settingsKey,
    ];

    keysToDelete.forEach(key => localStorage.removeItem(key));
    toast.success("All data deleted successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Profile</CardTitle>
                    <CardDescription>Your personal information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {user?.email || "guest@example.com"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Preferences</CardTitle>
                    <CardDescription>Customize your experience</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={handleCurrencyChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) =>
                        setSettings((prev) => ({
                          ...prev,
                          dateFormat: value as UserSettings["dateFormat"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DATE_FORMAT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Notifications</CardTitle>
                    <CardDescription>Manage alerts and reminders</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Budget Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when spending exceeds budget
                    </p>
                  </div>
                  <Switch
                    checked={settings.budgetAlerts}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, budgetAlerts: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Report</p>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly spending summary
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyReport}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, weeklyReport: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Enable browser notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, notifications: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Data Management</CardTitle>
                    <CardDescription>Export or delete your data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleExportAllData}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={handleDeleteAllData}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Data
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Export creates a JSON backup of all your transactions, goals, and settings.
                </p>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button
                variant="hero"
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
