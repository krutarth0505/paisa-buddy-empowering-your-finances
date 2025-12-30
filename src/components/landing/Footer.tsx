import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Product: [
      { label: "Features", href: "/#features" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "AI Insights", href: "/insights" },
      { label: "Learn", href: "/learn" },
    ],
    Company: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
    Support: [
      { label: "Help Center", href: "/help" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">₹</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                पैसा <span className="text-primary">Buddy</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your AI-powered financial companion for smarter money decisions.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with ❤️ for India
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 पैसा Buddy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Available in:</span>
            <span className="text-xs font-medium text-foreground">English</span>
            <span className="text-xs font-medium text-foreground">हिंदी</span>
            <span className="text-xs font-medium text-foreground">मराठी</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
