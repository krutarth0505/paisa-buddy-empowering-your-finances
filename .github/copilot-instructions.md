# Paisa Buddy – AI Contributor Guide

## Architecture Overview
- **Stack**: Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Radix primitives
- **Entry**: [src/main.tsx](src/main.tsx) → [src/App.tsx](src/App.tsx) with provider hierarchy: `ThemeProvider` → `AuthProvider` → `QueryClientProvider` → `TooltipProvider` → Toasters → `BrowserRouter`
- **Path alias**: `@/` → `src/` (defined in tsconfig + vite.config.ts); always prefer `@/` for imports
- **No backend yet**: All data persists to localStorage; auth is simulated. Backend integration (Supabase planned) will replace localStorage calls.
- **Types**: Centralized in [src/types/index.ts](src/types/index.ts) — includes `Transaction`, `Goal`, `Budget`, `User`, `ChatMessage`, `UserSettings`

## Commands
```bash
npm run dev      # Vite dev server on port 8080
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Serve production build locally
```

## Routing & Pages
- Routes defined in [src/App.tsx](src/App.tsx): Landing `/`, Dashboard, Transactions, Budget, Goals, Insights, Settings, Learn, Chat, Login, Signup, NotFound `*`
- **Protected routes**: Dashboard, Transactions, Budget, Goals, Insights, Settings are wrapped with `ProtectedRoute` component
- **Add new routes above the catch-all `*` route**
- Each page imports `Navbar` from [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx); extend `navLinks` array there for new nav items

## Custom Hooks
- **useTransactions**: [src/hooks/useTransactions.ts](src/hooks/useTransactions.ts) — CRUD operations, localStorage persistence, computed totals
- **useGoals**: [src/hooks/useGoals.ts](src/hooks/useGoals.ts) — Goal management with progress tracking
- **useBudgets**: [src/hooks/useBudgets.ts](src/hooks/useBudgets.ts) — Budget tracking with automatic spending calculation from transactions

## Data & State Patterns
- **Auth**: `useAuth()` from [src/context/AuthContext.tsx](src/context/AuthContext.tsx) — stores user in localStorage (`pb-user` key); includes `isLoading` state
- **Protected Routes**: Use `ProtectedRoute` from [src/components/layout/ProtectedRoute.tsx](src/components/layout/ProtectedRoute.tsx) for authenticated pages
- **User data isolation**: Per-user localStorage keys: `pb-transactions-{email}`, `pb-goals-{email}`, `pb-budgets-{email}`, `pb-settings-{email}`; fall back to `-guest` suffix
- **Use custom hooks**: Prefer `useTransactions()`, `useGoals()`, `useBudgets()` over manual localStorage handling
- **Demo data**: Unauthenticated users see static `demoTransactions`/`demoGoals` arrays; authenticated users load from localStorage
- **React Query**: Provider initialized but unused — prefer it for future API integration

## UI System & Styling
- **Components**: Use shadcn primitives from [src/components/ui/](src/components/ui/); don't reinvent Cards, Dialogs, Buttons, etc.
- **Button variants**: `default`, `hero` (gradient + glow), `glass`, `accent`, `success`, `outline` — see [src/components/ui/button.tsx](src/components/ui/button.tsx)
- **Color tokens**: Use semantic classes (`bg-primary`, `text-muted-foreground`, `bg-card`) from CSS vars in [src/index.css](src/index.css) — never hardcode HSL values
- **Custom utilities** (defined in [src/index.css](src/index.css)):
  - `.glass-card` — frosted glass effect
  - `.gradient-primary`, `.gradient-accent`, `.gradient-hero` — brand gradients
  - `.shadow-glow`, `.shadow-accent-glow` — subtle glow effects
  - `.text-gradient-primary` — gradient text
  - `.animate-float`, `.animate-fade-in`, `.animate-slide-up` — animation classes
- **Theme toggle**: Wired via [src/components/theme-provider.tsx](src/components/theme-provider.tsx) using `next-themes`; storage key is `paisa-buddy-theme`

## Code Conventions
- **Icons**: Use `lucide-react` exclusively (not FontAwesome or others)
- **Toasts**: Use `toast()` from `@/components/ui/sonner` for notifications — `toast.success()`, `toast.error()`, `toast("message")`
- **`cn()` helper**: Always use [src/lib/utils.ts](src/lib/utils.ts) `cn()` for conditional class merging
- **Types**: tsconfig is lenient (`noImplicitAny: false`), but prefer explicit typing in new code
- **Form validation**: Simple inline checks with `toast.error()` for feedback; no form library required for simple forms

## Data Shapes
```tsx
// Transaction (amount negative for expenses)
type Transaction = {
  id: number;
  name: string;
  category: string;  // "Food & Dining" | "Shopping" | "Housing" | "Transport" | etc.
  amount: number;    // negative = expense, positive = income
  date: string;
  type: "Essentials" | "Needs" | "Wants" | "Income";
};

// Goal
type Goal = {
  id: number;
  name: string;
  type: string;       // "Emergency" | "Vacation" | "Education" | "Home" | "Vehicle" | "Other"
  current: number;
  target: number;
  deadline: string;
  monthlyTarget: number;
  color: string;
};

// Chat Message
type Message = { id: number; role: "user" | "assistant"; content: string; timestamp: string; };
```

## Key Patterns
- **Icon mappings**: `categoryIcons` (transactions), `goalIcons` (goals) — objects mapping type names → lucide components
- **Color mappings**: `typeColors` for transaction badges, `goalColors` for goal progress bars
- **Charts**: Recharts (`AreaChart`, `PieChart`, `BarChart`, `LineChart`) with theme-aware tooltip styling
- **Currency formatting**: Use `Intl.NumberFormat('en-IN')` for ₹ display consistency
- **CSV Import**: Transactions page supports CSV upload with auto-detection of bank export format (Particulars/Debit/Credit columns) or standard format (name/category/amount/date/type)
- **Export**: JSON and CSV export available via blob download pattern
- **Dialog forms**: Use shadcn `Dialog` + controlled state for add/edit modals; reset form state on close

## Branding
- Brand name: "पैसा Buddy" (Devanagari + English) — preserve Unicode in headers/footers
- Primary color: teal (`hsl(174, 62%, 35%)`)
- Accent color: warm amber (`hsl(35, 95%, 55%)`)
- Font: Plus Jakarta Sans (loaded via Google Fonts in index.css)

## Common Tasks
- **Add a page**: Create in `src/pages/`, add route in App.tsx above `*`, optionally add to `navLinks` in Navbar.tsx
- **Add a shadcn component**: Use CLI or copy from [src/components/ui/](src/components/ui/) as reference
- **Persist user data**: Use `useAuth().user.email` for per-user storage keys with localStorage
- **Add CRUD for a resource**: Follow [Goals.tsx](src/pages/Goals.tsx) pattern — Dialog for form, localStorage persistence, `useMemo` for derived totals
- **Simulate API calls**: Use `setTimeout` with loading state (see Login.tsx `isSubmitting` pattern)
- **Chat integration**: Message shape is `{ id, role: "user"|"assistant", content, timestamp }`; simulate responses with `setTimeout` for now
