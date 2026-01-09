import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Briefcase, Coins, GraduationCap } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";

const incomeTypes = [
  { id: "fixed", label: "Fixed Salary", icon: Briefcase, description: "Regular monthly income" },
  { id: "variable", label: "Variable Income", icon: Coins, description: "Freelance / Commission-based" },
  { id: "gig", label: "Gig Worker", icon: GraduationCap, description: "Multiple income sources" },
];

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signUp, isSupabaseEnabled } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!name || !email || !password || !incomeType) {
      toast.error("Please complete all fields to continue.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    
    const { error } = await signUp(email, password, name);
    
    if (error) {
      toast.error(error.message || "Failed to create account. Please try again.");
      setIsSubmitting(false);
      return;
    }
    
    if (isSupabaseEnabled) {
      toast.success("Account created! Check your email to verify your account.");
    } else {
      toast.success("Account created! You're all set.");
    }
    navigate("/dashboard");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-bold text-2xl">₹</span>
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            पैसा <span className="text-primary">Buddy</span>
          </span>
        </Link>

        {/* Form Card */}
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              Start your journey to financial freedom
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Income Type */}
            <div className="space-y-3">
              <Label>Income Type</Label>
              <div className="grid gap-3">
                {incomeTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setIncomeType(type.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        incomeType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        incomeType === type.id ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Icon className={`w-5 h-5 ${incomeType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
