import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, Wallet, TrendingUp, Target, BarChart3, BookOpen, MessageCircle, PieChart, Settings } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/transactions", label: "Transactions", icon: Wallet },
    { href: "/budget", label: "Budget", icon: PieChart },
    { href: "/goals", label: "Goals", icon: Target },
    { href: "/insights", label: "AI Insights", icon: TrendingUp },
    { href: "/learn", label: "Learn", icon: BookOpen },
    { href: "/chat", label: "Consult", icon: MessageCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
              <span className="text-primary-foreground font-bold text-lg">₹</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              पैसा <span className="text-primary">Buddy</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/settings" className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted text-sm text-foreground hover:bg-muted/80 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="leading-tight">
                    <p className="font-medium">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-slide-down">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-3">
                {user ? (
                  <>
                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="leading-tight flex-1">
                        <p className="font-medium text-foreground">{user.name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                        navigate("/");
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="lg:hidden flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
