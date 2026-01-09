import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen,
  PlayCircle,
  CheckCircle,
  Lock,
  Star,
  Trophy,
  Clock,
  ChevronRight,
  ChevronLeft,
  Award,
  Lightbulb,
  Target,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Shield,
  Wallet,
  IndianRupee,
  GraduationCap,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

// Types
interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  keyPoints: string[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: "basics" | "investing" | "saving" | "planning";
  lessons: Lesson[];
  badge?: string;
}

// Course Data with actual educational content
const coursesData: Course[] = [
  {
    id: "budgeting-101",
    title: "Budgeting Basics",
    description: "Learn the 50/30/20 rule and create your first budget",
    icon: Wallet,
    difficulty: "Beginner",
    category: "basics",
    badge: "Budget Master",
    lessons: [
      {
        id: "b1-l1",
        title: "What is a Budget?",
        duration: "5 min",
        content: `A budget is simply a plan for your money. It tells your rupees where to go instead of wondering where they went!

**Why Budget?**
Think of a budget like a GPS for your finances. Without it, you might reach your destination eventually, but with lots of wrong turns and wasted fuel. A budget helps you:

• **Control spending** – Know exactly where your money goes
• **Reach goals faster** – Save for that phone, bike, or vacation
• **Reduce stress** – No more "where did my salary go?" moments
• **Build wealth** – Small savings compound into big amounts over time

**The Indian Context**
In India, many of us grow up without formal financial education. We learn from family, but times have changed. EMIs, UPI payments, and online shopping make it easier than ever to overspend. A budget brings back control.`,
        keyPoints: [
          "A budget is a spending plan, not a restriction",
          "It helps you prioritize what matters most",
          "Everyone needs a budget, regardless of income",
          "Digital payments make budgeting more important than ever"
        ],
        quiz: {
          question: "What is the primary purpose of a budget?",
          options: [
            "To restrict all spending",
            "To plan where your money goes",
            "To earn more money",
            "To avoid using banks"
          ],
          correctIndex: 1,
          explanation: "A budget is a plan that helps you allocate your money intentionally, not a tool to restrict all spending."
        }
      },
      {
        id: "b1-l2",
        title: "The 50/30/20 Rule",
        duration: "7 min",
        content: `The 50/30/20 rule is a simple framework for dividing your income. It was popularized by US Senator Elizabeth Warren and works beautifully in India too!

**The Breakdown:**

**50% – Needs (Essentials)**
These are expenses you cannot avoid:
• Rent or home loan EMI
• Groceries and utilities (electricity, water, gas)
• Transportation to work
• Basic phone/internet
• Health insurance premiums
• Minimum loan payments

**30% – Wants (Lifestyle)**
Things that improve quality of life but aren't essential:
• Eating out, Swiggy, Zomato
• Shopping (clothes, gadgets beyond basics)
• Entertainment (Netflix, movies, concerts)
• Vacations and travel
• Gym membership
• Upgraded phone/internet plans

**20% – Savings & Investments**
Building your future:
• Emergency fund
• Retirement (NPS, PPF, EPF voluntary)
• Mutual funds and SIPs
• Fixed deposits
• Paying off debt faster (beyond minimum)

**Example: ₹50,000 Salary**
• Needs: ₹25,000
• Wants: ₹15,000  
• Savings: ₹10,000

**Adjust for India**
In high-cost cities like Mumbai or Bangalore, you might need 60% for needs. That's okay! Adjust the wants down to 20% and keep savings at 20%.`,
        keyPoints: [
          "50% for needs – rent, groceries, utilities, EMIs",
          "30% for wants – entertainment, dining out, shopping",
          "20% for savings – emergency fund, investments, debt repayment",
          "Adjust percentages based on your city and lifestyle"
        ],
        quiz: {
          question: "According to the 50/30/20 rule, what percentage should go to savings?",
          options: ["50%", "30%", "20%", "10%"],
          correctIndex: 2,
          explanation: "The 50/30/20 rule recommends allocating 20% of your income to savings and investments."
        }
      },
      {
        id: "b1-l3",
        title: "Tracking Your Expenses",
        duration: "6 min",
        content: `You can't improve what you don't measure. Expense tracking is the foundation of good budgeting.

**Methods to Track:**

**1. The Paisa Buddy Way (Recommended!)**
Use this app! Import your bank statements, categorize transactions, and see insights automatically. That's why you're here! 😊

**2. Bank Statement Review**
• Download statements monthly
• Most banks offer spending analysis
• Look for patterns and surprises

**3. UPI App History**
• Google Pay, PhonePe, Paytm all show transaction history
• Good for quick checks

**4. The Envelope Method (Old School)**
• Withdraw cash for categories (groceries, transport, fun)
• When envelope is empty, stop spending in that category
• Very effective for overspenders!

**What to Track:**
• Every UPI payment
• Cash withdrawals and spending
• Auto-debits and subscriptions
• EMIs and loan payments

**Review Weekly**
Spend 10 minutes every Sunday reviewing your week. Ask:
• Any surprise expenses?
• Did I overspend on wants?
• Am I on track for my savings goal?

**Pro Tip:** The first month of tracking is often shocking. Most people underestimate their food delivery and shopping by 40-50%!`,
        keyPoints: [
          "Track every expense for at least one month",
          "Use apps or bank statements for accuracy",
          "Review spending weekly to stay on track",
          "Most people underestimate dining and shopping expenses"
        ],
        quiz: {
          question: "How often should you review your expenses?",
          options: [
            "Once a year",
            "Only when you're broke",
            "Weekly",
            "Never, apps handle everything"
          ],
          correctIndex: 2,
          explanation: "Weekly reviews (10-15 minutes) help you catch overspending early and stay on track with your budget."
        }
      },
      {
        id: "b1-l4",
        title: "Creating Your First Budget",
        duration: "8 min",
        content: `Now let's build your actual budget! Follow these steps:

**Step 1: Calculate Your Income**
Add up all money coming in:
• Salary (after TDS)
• Freelance/side income
• Rent from property
• Interest from FDs
• Any other regular income

**Step 2: List Fixed Expenses**
These stay same monthly:
• Rent/EMI
• Insurance premiums
• Subscriptions (Netflix, Spotify, gym)
• Internet and phone bills
• Loan EMIs

**Step 3: Estimate Variable Expenses**
These change monthly:
• Groceries
• Transportation (petrol, metro, auto)
• Utilities (electricity varies by season)
• Dining out
• Shopping

**Step 4: Set Savings Goals**
Decide what you're saving for:
• Emergency fund (3-6 months expenses)
• Short-term (vacation, new phone)
• Long-term (house, retirement)

**Step 5: Build the Budget**

| Category | Amount | % |
|----------|--------|---|
| Income | ₹50,000 | 100% |
| Rent | ₹15,000 | 30% |
| Groceries | ₹5,000 | 10% |
| Transport | ₹3,000 | 6% |
| Utilities | ₹2,000 | 4% |
| Wants | ₹10,000 | 20% |
| Savings | ₹10,000 | 20% |
| Buffer | ₹5,000 | 10% |

**Step 6: Track and Adjust**
Your first budget won't be perfect. Track for a month, then adjust. Did you budget ₹5000 for groceries but spent ₹7000? Either cut elsewhere or increase that category.

**The 10% Buffer**
Always keep some buffer for unexpected expenses – auto repairs, medical, gifts for weddings. Life happens!`,
        keyPoints: [
          "Start with your actual income after taxes",
          "List both fixed and variable expenses",
          "Always include a buffer for unexpected costs",
          "Adjust your budget monthly based on actual spending"
        ]
      }
    ]
  },
  {
    id: "emergency-fund",
    title: "Emergency Fund Essentials",
    description: "Build your financial safety net",
    icon: Shield,
    difficulty: "Beginner",
    category: "saving",
    badge: "Safety Net Builder",
    lessons: [
      {
        id: "ef-l1",
        title: "Why You Need an Emergency Fund",
        duration: "5 min",
        content: `An emergency fund is money set aside for life's unexpected moments. It's your financial safety net.

**What Counts as an Emergency?**
✅ Job loss or salary cut
✅ Medical emergencies
✅ Urgent home or vehicle repairs
✅ Family emergencies requiring travel
✅ Unexpected legal issues

**What's NOT an Emergency?**
❌ Sale at your favorite store
❌ New phone launch
❌ Friend's destination wedding
❌ That vacation "everyone" is taking

**Why Not Use Credit Cards?**
• Credit cards charge 24-42% annual interest
• Debt creates stress during already stressful times
• EMI payments reduce future budget flexibility

**The Peace of Mind Factor**
Having an emergency fund changes how you feel about life. You're not one paycheck away from disaster. You can take career risks, negotiate better, and sleep peacefully.

**Real Stories from India**
During COVID-19, millions lost jobs overnight. Those with emergency funds could pay rent and buy groceries while looking for new work. Those without had to borrow at high interest or return to villages.`,
        keyPoints: [
          "Emergency funds prevent debt during crises",
          "Only use for true emergencies, not sales or wants",
          "Provides mental peace and career flexibility",
          "3-6 months of expenses is the target"
        ],
        quiz: {
          question: "Which of these is a valid emergency fund use?",
          options: [
            "Diwali sale shopping",
            "New iPhone launch",
            "Unexpected medical surgery",
            "Friend's wedding in Goa"
          ],
          correctIndex: 2,
          explanation: "Emergency funds should only be used for unexpected, necessary expenses like medical emergencies, not planned events or wants."
        }
      },
      {
        id: "ef-l2",
        title: "How Much to Save",
        duration: "6 min",
        content: `The magic number is 3-6 months of expenses. But how do you calculate it?

**Calculate Your Monthly Expenses**
Add up your essential spending:
• Rent/EMI
• Groceries
• Utilities
• Transportation
• Insurance
• Minimum debt payments

**Example Calculation:**
Monthly essentials = ₹35,000
• 3 months = ₹1,05,000
• 6 months = ₹2,10,000

**Who Needs More?**
6+ months if you:
• Work in a volatile industry (startups, media)
• Are the sole earner in family
• Have dependents (parents, kids)
• Are self-employed or freelance
• Have health conditions

**Who Can Start with Less?**
3 months might be okay if you:
• Have stable government/PSU job
• Have working spouse
• Live with parents
• Have no dependents

**Start Small, Build Up**
Don't wait to save the full amount! Start with:
• Week 1: ₹1,000
• Month 1: ₹5,000
• Month 3: ₹20,000
• Year 1: ₹1,00,000+

Every bit helps. ₹10,000 in an emergency is better than ₹0!`,
        keyPoints: [
          "Target 3-6 months of essential expenses",
          "More if you're self-employed or sole earner",
          "Calculate based on needs, not current spending",
          "Start small and build gradually"
        ],
        quiz: {
          question: "If your monthly expenses are ₹40,000, what's your minimum emergency fund target?",
          options: ["₹40,000", "₹80,000", "₹1,20,000", "₹4,80,000"],
          correctIndex: 2,
          explanation: "Minimum emergency fund is 3 months of expenses. ₹40,000 × 3 = ₹1,20,000."
        }
      },
      {
        id: "ef-l3",
        title: "Where to Keep Your Emergency Fund",
        duration: "5 min",
        content: `Your emergency fund needs to be safe, accessible, and separate from regular savings.

**Best Options in India:**

**1. High-Yield Savings Account (Recommended)**
• Earn 3-7% interest
• Instant access via UPI/NEFT
• Examples: Kotak 811, Jupiter, Fi
• FDIC-equivalent protection up to ₹5 lakh

**2. Liquid Mutual Funds**
• Slightly higher returns (5-7%)
• Redeems in 24 hours
• Very low risk
• No lock-in period

**3. Fixed Deposit with Premature Withdrawal**
• Guaranteed returns
• Penalty for early withdrawal (0.5-1%)
• Good for part of emergency fund

**4. Sweep-in Fixed Deposits**
• FD returns with savings account access
• Money sweeps in/out automatically
• Best of both worlds

**What to AVOID:**
❌ Stocks or equity mutual funds (too volatile)
❌ PPF/NPS (locked for years)
❌ Real estate
❌ Gold (hard to sell quickly at fair price)
❌ Cash at home (tempting to spend, no interest)

**Pro Tip: The Bucket System**
• Bucket 1: ₹20,000 in savings (immediate access)
• Bucket 2: ₹50,000 in liquid fund (24-48 hrs)
• Bucket 3: Rest in FD (2-3 days)

This earns better returns while keeping money accessible!`,
        keyPoints: [
          "High-yield savings accounts offer instant access",
          "Liquid mutual funds give slightly better returns",
          "Never invest emergency funds in stocks or equity",
          "Keep some immediately accessible, rest can take 24-48 hours"
        ]
      }
    ]
  },
  {
    id: "sip-investing",
    title: "SIP & Mutual Funds",
    description: "Start investing with as little as ₹500/month",
    icon: TrendingUp,
    difficulty: "Intermediate",
    category: "investing",
    badge: "Investor",
    lessons: [
      {
        id: "sip-l1",
        title: "What are Mutual Funds?",
        duration: "7 min",
        content: `A mutual fund pools money from many investors to buy stocks, bonds, or other assets. Professional fund managers handle the investments.

**Think of it Like This:**
Imagine 1000 people each giving ₹1000 to an expert chef. The chef buys ingredients wholesale (cheaper!), cooks a feast, and everyone gets a portion. Mutual funds work similarly with investments.

**Benefits of Mutual Funds:**

**1. Professional Management**
• Expert fund managers research and pick investments
• Full-time monitoring of markets
• You don't need to be an expert

**2. Diversification**
• One fund owns 50-100+ stocks
• If one company fails, others balance it
• Much safer than buying single stocks

**3. Accessibility**
• Start with just ₹500/month
• No need for ₹10 lakhs to diversify

**4. Liquidity**
• Sell anytime (except ELSS lock-in)
• Money in your account within 1-3 days

**5. Transparency**
• SEBI regulated
• Monthly portfolio disclosure
• NAV published daily

**Types of Mutual Funds:**
• Equity Funds: Invest in stocks (higher risk/return)
• Debt Funds: Invest in bonds (lower risk/return)
• Hybrid Funds: Mix of both
• Index Funds: Mirror an index like Nifty 50
• ELSS: Tax-saving equity funds (3-year lock-in)`,
        keyPoints: [
          "Mutual funds pool money from many investors",
          "Professional managers handle investment decisions",
          "Diversification reduces risk compared to single stocks",
          "Start with just ₹500 per month"
        ],
        quiz: {
          question: "What is a key benefit of mutual funds over buying individual stocks?",
          options: [
            "Guaranteed returns",
            "Zero risk",
            "Diversification across many stocks",
            "Higher dividends"
          ],
          correctIndex: 2,
          explanation: "Mutual funds provide diversification by spreading investments across many stocks, reducing the impact of any single company's poor performance."
        }
      },
      {
        id: "sip-l2",
        title: "SIP: The Power of Regular Investing",
        duration: "8 min",
        content: `SIP (Systematic Investment Plan) means investing a fixed amount regularly – usually monthly. It's the easiest way to build wealth.

**Why SIP Works:**

**1. Rupee Cost Averaging**
When markets fall, your ₹5000 buys more units. When markets rise, it buys fewer. Over time, you average out the price.

Example with ₹5000/month:
| Month | NAV | Units Bought |
|-------|-----|--------------|
| Jan | ₹50 | 100 |
| Feb | ₹40 | 125 |
| Mar | ₹60 | 83 |
| Apr | ₹50 | 100 |

Total: ₹20,000 invested, 408 units
Average cost: ₹49/unit (lower than buying all at ₹50!)

**2. No Timing Required**
• Trying to time the market is nearly impossible
• Even experts get it wrong
• SIP removes the stress of "when to invest"

**3. Discipline Through Automation**
• Set up auto-debit
• Money goes before you can spend it
• Builds investing habit

**4. Power of Compounding**
₹5000/month at 12% annual return:
• 5 years: ₹4.1 lakh (invested ₹3 lakh)
• 10 years: ₹11.6 lakh (invested ₹6 lakh)
• 20 years: ₹49.9 lakh (invested ₹12 lakh)
• 30 years: ₹1.76 crore (invested ₹18 lakh)

The earlier you start, the more compounding helps!

**How to Start a SIP:**
1. Complete KYC (takes 10 minutes online)
2. Choose a fund (index funds for beginners)
3. Set amount and date
4. Link bank account
5. Relax and let it grow!

**Best Platforms:**
• Groww, Zerodha Coin, Kuvera (Direct, lower fees)
• Paytm Money, ET Money
• Bank apps (usually regular plans, higher fees)`,
        keyPoints: [
          "SIP automates investing with fixed monthly amounts",
          "Rupee cost averaging reduces timing risk",
          "Compounding makes small amounts grow significantly",
          "Start with index funds for simplicity"
        ],
        quiz: {
          question: "What is rupee cost averaging in SIP?",
          options: [
            "Getting the same price every month",
            "Buying more units when prices are low, fewer when high",
            "Converting dollars to rupees",
            "Selling when prices rise"
          ],
          correctIndex: 1,
          explanation: "Rupee cost averaging means your fixed monthly investment buys more units when prices are low and fewer when high, averaging your purchase cost over time."
        }
      },
      {
        id: "sip-l3",
        title: "Choosing Your First Fund",
        duration: "7 min",
        content: `With thousands of funds available, here's how to pick wisely.

**For Beginners: Index Funds**
Index funds simply copy an index like Nifty 50. They're perfect for beginners because:
• Low cost (0.1-0.5% vs 1-2% for active funds)
• No fund manager risk
• Match market returns consistently
• Simple to understand

**Recommended Starter Funds:**
• UTI Nifty 50 Index Fund
• HDFC Index Fund – Nifty 50
• Nippon India Nifty 50 BeES (ETF)
• Mirae Asset Tax Saver (if you want tax benefits)

**What to Check Before Investing:**

**1. Expense Ratio**
• Direct plans: 0.1-1%
• Regular plans: 1-2%
• Always choose Direct plans!

**2. Fund Size (AUM)**
• Larger is generally better
• ₹500 crore+ is a good minimum

**3. Track Record**
• Compare 3-5 year returns
• Check performance in good AND bad years
• Past performance doesn't guarantee future returns

**4. Fund Manager (for active funds)**
• How long have they managed this fund?
• Performance of their other funds?

**Asset Allocation by Age (Rule of Thumb):**
Equity % = 100 - Your Age

At 25: 75% equity, 25% debt
At 40: 60% equity, 40% debt
At 60: 40% equity, 60% debt

**Simple Starter Portfolio:**
• 60% Nifty 50 Index Fund
• 20% Nifty Next 50 Index Fund
• 20% Liquid/Debt Fund

This gives you diversification with just 3 funds!`,
        keyPoints: [
          "Start with low-cost index funds",
          "Always choose Direct plans over Regular",
          "Check expense ratio, fund size, and track record",
          "Age-based allocation: more equity when young"
        ]
      }
    ]
  },
  {
    id: "tax-saving",
    title: "Tax Saving for Beginners",
    description: "Save taxes legally under Section 80C and beyond",
    icon: IndianRupee,
    difficulty: "Intermediate",
    category: "planning",
    badge: "Tax Saver",
    lessons: [
      {
        id: "tax-l1",
        title: "Understanding Section 80C",
        duration: "8 min",
        content: `Section 80C is your best friend for saving taxes. You can claim up to ₹1.5 lakh deduction!

**What is Section 80C?**
It's a section of the Income Tax Act that lets you reduce your taxable income by investing in specified instruments.

**The Math:**
If you earn ₹10 lakh and invest ₹1.5 lakh in 80C options:
• Taxable income = ₹10L - ₹1.5L = ₹8.5L
• Tax saved = ₹1.5L × 20-30% = ₹30,000-45,000!

**Popular 80C Options:**

**1. ELSS Mutual Funds** ⭐ (Recommended)
• Shortest lock-in: 3 years
• Highest potential returns (12-15% historically)
• Start SIP with ₹500/month
• Best for wealth creation + tax saving

**2. EPF (Employee Provident Fund)**
• Already deducted from salary
• 8.1% guaranteed returns
• Locked until retirement

**3. PPF (Public Provident Fund)**
• 7.1% interest (tax-free!)
• 15-year lock-in
• Government backed, zero risk
• Great for conservative investors

**4. Life Insurance Premium**
• Only if you have dependents
• Avoid investment + insurance combos (LIC endowment)
• Pure term insurance is better

**5. NSC (National Savings Certificate)**
• 7-7.5% returns
• 5-year lock-in
• Good for risk-averse

**6. Tax-Saving FD**
• 5-year lock-in
• Returns taxable (unlike PPF)
• Last resort option

**7. Tuition Fees**
• Children's school/college fees
• Often forgotten!

**8. Home Loan Principal**
• Part of EMI
• Up to ₹1.5 lakh`,
        keyPoints: [
          "Section 80C allows up to ₹1.5 lakh tax deduction",
          "ELSS has shortest lock-in (3 years) with highest returns",
          "PPF is best for risk-free tax-saving",
          "EPF contribution from salary already counts"
        ],
        quiz: {
          question: "What is the maximum deduction allowed under Section 80C?",
          options: ["₹50,000", "₹1,00,000", "₹1,50,000", "₹2,00,000"],
          correctIndex: 2,
          explanation: "Section 80C allows deduction of up to ₹1,50,000 from your taxable income."
        }
      },
      {
        id: "tax-l2",
        title: "Beyond 80C: Other Tax Deductions",
        duration: "6 min",
        content: `There's more to tax saving than just 80C! Here are other sections you can use:

**Section 80D: Health Insurance**
• Premium for self/family: Up to ₹25,000
• Premium for parents (senior): Up to ₹50,000
• Total possible: ₹75,000 - ₹1 lakh deduction

**Section 80E: Education Loan Interest**
• No upper limit!
• For self, spouse, or children
• Available for 8 years from start of repayment

**Section 80G: Donations**
• 50-100% deduction for eligible charities
• PM Relief Fund gets 100%
• Most NGOs get 50%
• Keep receipts!

**Section 24: Home Loan Interest**
• Up to ₹2 lakh deduction
• This is separate from 80C principal
• Even for under-construction property

**Section 80TTA: Savings Account Interest**
• Up to ₹10,000 deduction
• For savings account interest only

**Section 80CCD(1B): NPS**
• Additional ₹50,000 above 80C limit
• Total with 80C: ₹2 lakh deduction
• NPS has long lock-in though

**HRA (House Rent Allowance)**
• If you're salaried and pay rent
• Can be substantial in metros
• Submit rent receipts to employer

**Standard Deduction**
• ₹50,000 flat deduction for salaried
• No documents needed

**Example Tax Saving Plan:**
| Section | Investment | Deduction |
|---------|------------|-----------|
| 80C | ELSS SIP | ₹1,50,000 |
| 80CCD(1B) | NPS | ₹50,000 |
| 80D | Health Insurance | ₹50,000 |
| 24 | Home Loan Interest | ₹2,00,000 |
| Standard | Flat | ₹50,000 |
| **Total** | | **₹5,00,000** |`,
        keyPoints: [
          "80D covers health insurance (₹25,000-₹50,000)",
          "80CCD(1B) adds ₹50,000 extra via NPS",
          "Home loan interest gives ₹2 lakh deduction",
          "Plan early, invest throughout the year"
        ]
      }
    ]
  },
  {
    id: "credit-score",
    title: "Credit Score Decoded",
    description: "Understand and improve your CIBIL score",
    icon: CreditCard,
    difficulty: "Beginner",
    category: "basics",
    badge: "Credit Master",
    lessons: [
      {
        id: "cs-l1",
        title: "What is a Credit Score?",
        duration: "5 min",
        content: `Your credit score is a 3-digit number (300-900) that tells lenders how risky you are as a borrower.

**Credit Bureaus in India:**
• CIBIL (most popular)
• Experian
• Equifax
• CRIF Highmark

**Score Ranges:**
• 750-900: Excellent ✅
• 700-749: Good
• 650-699: Fair
• Below 650: Poor ❌

**Why It Matters:**

**1. Loan Approval**
Banks check your score first. Below 650? Many reject immediately.

**2. Interest Rates**
Higher score = lower interest rate
• Score 750+: Get 8% home loan
• Score 650: Might pay 11-12%

On a ₹50 lakh home loan over 20 years:
• 8%: Total interest = ₹50 lakh
• 12%: Total interest = ₹87 lakh
Difference: ₹37 lakh just for lower score!

**3. Credit Card Limits**
Premium cards require 750+ scores

**4. Faster Processing**
Good score = quick approval, less documentation

**5. Rental Applications**
Some landlords now check credit scores

**6. Job Applications**
Financial sector companies may check

**Factors That Affect Score:**
• Payment history (35%) – Pay on time!
• Credit utilization (30%) – Don't max cards
• Credit history length (15%)
• Credit mix (10%)
• New credit inquiries (10%)`,
        keyPoints: [
          "Credit scores range from 300 to 900",
          "750+ is considered excellent",
          "Higher scores mean lower loan interest rates",
          "Payment history is the biggest factor (35%)"
        ],
        quiz: {
          question: "What is considered an excellent credit score in India?",
          options: ["300-500", "500-650", "650-750", "750-900"],
          correctIndex: 3,
          explanation: "A credit score of 750-900 is considered excellent and helps you get the best loan terms and credit card offers."
        }
      },
      {
        id: "cs-l2",
        title: "How to Improve Your Score",
        duration: "6 min",
        content: `Building a good credit score takes time, but these strategies work:

**1. Pay Bills on Time (Most Important!)**
• Set up auto-pay for credit cards
• Pay at least minimum due (full is better)
• Even one missed payment hurts for years
• Set reminders 3-5 days before due date

**2. Keep Credit Utilization Low**
• Use less than 30% of your credit limit
• Example: ₹1 lakh limit → spend under ₹30k
• If needed, ask for limit increase
• Pay before statement date to show lower utilization

**3. Don't Close Old Cards**
• Older accounts help your score
• Even if not using, keep them active
• Make a small purchase monthly

**4. Limit Hard Inquiries**
• Each loan/card application = hard inquiry
• Many inquiries = looks desperate
• Space out applications 6 months apart

**5. Check Your Report for Errors**
• Get free report from CIBIL annually
• Look for wrong accounts or amounts
• Dispute errors immediately

**6. Have a Credit Mix**
• Credit card + personal loan + home loan
• Shows you can handle different credit types

**7. Don't Settle Loans**
• "Settled" status is bad
• Always try to pay full amount
• Settled stays on report for 7 years

**Timeline for Improvement:**
• 1 month: Small improvements possible
• 3-6 months: Noticeable change
• 12 months: Significant improvement
• Bad marks: Stay for 7 years

**Quick Wins:**
✅ Add as authorized user on family's old card
✅ Correct errors on your report
✅ Pay off small outstanding balances
✅ Increase credit limits without new spending`,
        keyPoints: [
          "Always pay at least minimum due on time",
          "Keep credit card usage below 30% of limit",
          "Don't close old credit accounts",
          "Check credit report annually for errors"
        ]
      }
    ]
  },
  {
    id: "goal-setting",
    title: "Financial Goal Setting",
    description: "Set SMART financial goals and achieve them",
    icon: Target,
    difficulty: "Beginner",
    category: "planning",
    lessons: [
      {
        id: "gs-l1",
        title: "Setting SMART Financial Goals",
        duration: "6 min",
        content: `Dreams become reality when they become goals. Let's make your financial dreams achievable with SMART goals.

**SMART Framework:**

**S – Specific**
❌ "I want to save money"
✅ "I want to save for a Royal Enfield Classic 350"

**M – Measurable**
❌ "Save a lot"
✅ "Save ₹2 lakh"

**A – Achievable**
• Can you realistically save this amount?
• Given your income and expenses?
• ₹50,000/month savings on ₹40,000 salary = NOT achievable

**R – Relevant**
• Does this goal align with your values?
• Why is this important to YOU?
• Not your parents' dreams or society's expectations

**T – Time-bound**
❌ "Someday"
✅ "By December 2027" (within 2 years)

**Example SMART Goals:**
1. "Save ₹1 lakh for emergency fund by September 2026"
2. "Pay off ₹2 lakh credit card debt in 12 months"
3. "Accumulate ₹5 lakh for MBA down payment by 2028"
4. "Build ₹50 lakh retirement corpus by age 45"

**Categorize Your Goals:**

**Short-term (0-2 years)**
• Emergency fund
• Vacation
• New phone/laptop
• Wedding/event

**Medium-term (2-7 years)**
• Car down payment
• Higher education
• Wedding (your own)
• Starting a business

**Long-term (7+ years)**
• House down payment
• Children's education
• Retirement
• Financial independence

**Write Them Down!**
Written goals are 42% more likely to be achieved than unwritten ones. Use the Goals feature in पैसा Buddy!`,
        keyPoints: [
          "SMART: Specific, Measurable, Achievable, Relevant, Time-bound",
          "Categorize into short, medium, and long-term goals",
          "Written goals are 42% more likely to succeed",
          "Break big goals into monthly savings targets"
        ],
        quiz: {
          question: "Which is a SMART financial goal?",
          options: [
            "Save lots of money soon",
            "Become rich",
            "Save ₹1 lakh for emergency fund by June 2026",
            "Maybe buy a house someday"
          ],
          correctIndex: 2,
          explanation: "This goal is Specific (emergency fund), Measurable (₹1 lakh), Achievable, Relevant, and Time-bound (June 2026)."
        }
      }
    ]
  }
];

// Local storage keys
const getProgressKey = (email: string) => `pb-learn-progress-${email || 'guest'}`;

interface LearningProgress {
  completedLessons: string[];
  earnedBadges: string[];
  lastAccessedCourse: string | null;
}

const Learn = () => {
  const { user } = useAuth();
  const storageKey = getProgressKey(user?.email || '');
  
  // Load progress from localStorage
  const loadProgress = (): LearningProgress => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load learning progress:", e);
    }
    return { completedLessons: [], earnedBadges: [], lastAccessedCourse: null };
  };
  
  const [progress, setProgress] = useState<LearningProgress>(loadProgress);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Save progress to localStorage
  const saveProgress = (newProgress: LearningProgress) => {
    setProgress(newProgress);
    localStorage.setItem(storageKey, JSON.stringify(newProgress));
  };

  // Filter courses by category
  const filteredCourses = useMemo(() => {
    if (activeTab === "all") return coursesData;
    return coursesData.filter(c => c.category === activeTab);
  }, [activeTab]);

  // Calculate overall progress
  const stats = useMemo(() => {
    const totalLessons = coursesData.reduce((sum, c) => sum + c.lessons.length, 0);
    const completedCount = progress.completedLessons.length;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    return { totalLessons, completedCount, percentage };
  }, [progress]);

  // Get course completion percentage
  const getCourseProgress = (course: Course) => {
    const completedInCourse = course.lessons.filter(l => 
      progress.completedLessons.includes(l.id)
    ).length;
    return Math.round((completedInCourse / course.lessons.length) * 100);
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string) => progress.completedLessons.includes(lessonId);

  // Mark lesson as completed
  const completeLesson = (lessonId: string, course: Course) => {
    if (isLessonCompleted(lessonId)) return;
    
    const newCompleted = [...progress.completedLessons, lessonId];
    const newBadges = [...progress.earnedBadges];
    
    // Check if course is now complete
    const allLessonsComplete = course.lessons.every(l => 
      l.id === lessonId || progress.completedLessons.includes(l.id)
    );
    
    if (allLessonsComplete && course.badge && !newBadges.includes(course.badge)) {
      newBadges.push(course.badge);
      toast.success(`🏆 Badge earned: ${course.badge}!`);
    }
    
    saveProgress({
      ...progress,
      completedLessons: newCompleted,
      earnedBadges: newBadges,
      lastAccessedCourse: course.id
    });
    
    toast.success("Lesson completed! 🎉");
  };

  // Handle quiz submission
  const handleQuizSubmit = () => {
    if (selectedAnswer === null) return;
    setQuizSubmitted(true);
  };

  // Move to next lesson
  const nextLesson = () => {
    if (!selectedCourse) return;
    
    if (currentLessonIndex < selectedCourse.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
      setShowQuiz(false);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
    } else {
      // Course complete
      setSelectedCourse(null);
      setCurrentLessonIndex(0);
    }
  };

  // Previous lesson
  const prevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
      setShowQuiz(false);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
    }
  };

  // Start a course
  const startCourse = (course: Course) => {
    setSelectedCourse(course);
    // Find first incomplete lesson
    const firstIncomplete = course.lessons.findIndex(l => !isLessonCompleted(l.id));
    setCurrentLessonIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
  };

  const difficultyColors: Record<string, string> = {
    "Beginner": "bg-success/10 text-success border-success/20",
    "Intermediate": "bg-accent/10 text-accent border-accent/20",
    "Advanced": "bg-primary/10 text-primary border-primary/20",
  };

  const categoryIcons: Record<string, React.ElementType> = {
    basics: BookOpen,
    investing: TrendingUp,
    saving: PiggyBank,
    planning: Target,
  };

  // Render lesson content
  if (selectedCourse) {
    const lesson = selectedCourse.lessons[currentLessonIndex];
    const currentQuiz = lesson.quiz;
    
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Course Header */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
              <div className="text-sm text-muted-foreground">
                Lesson {currentLessonIndex + 1} of {selectedCourse.lessons.length}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <Progress value={((currentLessonIndex + 1) / selectedCourse.lessons.length) * 100} className="h-2" />
            </div>

            {/* Lesson Card */}
            <Card className="border-border/50 mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={difficultyColors[selectedCourse.difficulty]}>
                        {selectedCourse.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{lesson.title}</CardTitle>
                  </div>
                  {isLessonCompleted(lesson.id) && (
                    <CheckCircle className="w-6 h-6 text-success" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showQuiz ? (
                  <>
                    {/* Lesson Content */}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {lesson.content.split('\n\n').map((paragraph, idx) => (
                        <div key={idx} className="mb-4">
                          {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                            <h3 className="font-semibold text-foreground mt-6 mb-2">
                              {paragraph.replace(/\*\*/g, '')}
                            </h3>
                          ) : paragraph.startsWith('•') || paragraph.startsWith('✅') || paragraph.startsWith('❌') ? (
                            <div className="text-muted-foreground whitespace-pre-wrap">
                              {paragraph}
                            </div>
                          ) : paragraph.includes('|') ? (
                            <div className="overflow-x-auto">
                              <pre className="text-xs bg-muted/50 p-3 rounded-lg">
                                {paragraph}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {paragraph.split(/(\*\*[^*]+\*\*)/g).map((part, i) => 
                                part.startsWith('**') && part.endsWith('**') 
                                  ? <strong key={i} className="text-foreground">{part.replace(/\*\*/g, '')}</strong>
                                  : part
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Key Points */}
                    {lesson.keyPoints && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          Key Takeaways
                        </h4>
                        <ul className="space-y-2">
                          {lesson.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : currentQuiz && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                      <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-accent" />
                        Quick Quiz
                      </h4>
                      <p className="text-foreground mb-4">{currentQuiz.question}</p>
                      
                      <div className="space-y-2">
                        {currentQuiz.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => !quizSubmitted && setSelectedAnswer(idx)}
                            disabled={quizSubmitted}
                            className={`w-full p-3 rounded-lg text-left text-sm transition-all ${
                              quizSubmitted
                                ? idx === currentQuiz.correctIndex
                                  ? 'bg-success/20 border-success text-success'
                                  : idx === selectedAnswer
                                    ? 'bg-destructive/20 border-destructive text-destructive'
                                    : 'bg-muted/50 border-muted-foreground/20 text-muted-foreground'
                                : selectedAnswer === idx
                                  ? 'bg-primary/20 border-primary text-foreground'
                                  : 'bg-muted/50 border-transparent hover:bg-muted text-foreground'
                            } border`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>

                      {quizSubmitted && (
                        <div className={`mt-4 p-3 rounded-lg ${
                          selectedAnswer === currentQuiz.correctIndex 
                            ? 'bg-success/10 text-success' 
                            : 'bg-accent/10 text-accent'
                        }`}>
                          <p className="font-medium mb-1">
                            {selectedAnswer === currentQuiz.correctIndex ? '✅ Correct!' : '💡 Not quite!'}
                          </p>
                          <p className="text-sm opacity-90">{currentQuiz.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={prevLesson}
                disabled={currentLessonIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {lesson.quiz && !showQuiz && (
                  <Button variant="outline" onClick={() => setShowQuiz(true)}>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Take Quiz
                  </Button>
                )}
                
                {showQuiz && !quizSubmitted && (
                  <Button 
                    onClick={handleQuizSubmit}
                    disabled={selectedAnswer === null}
                  >
                    Submit Answer
                  </Button>
                )}

                {(!lesson.quiz || (showQuiz && quizSubmitted)) && (
                  <>
                    {!isLessonCompleted(lesson.id) && (
                      <Button 
                        variant="default"
                        onClick={() => completeLesson(lesson.id, selectedCourse)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    <Button onClick={nextLesson}>
                      {currentLessonIndex === selectedCourse.lessons.length - 1 ? 'Finish Course' : 'Next Lesson'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main course listing view
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Financial Literacy
              </h1>
              <p className="text-muted-foreground">Learn to manage your money like a pro</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{stats.percentage}%</p>
                <p className="text-xs text-muted-foreground">{stats.completedCount}/{stats.totalLessons} lessons</p>
              </div>
            </div>
          </div>

          {/* Progress & Badges Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Progress Card */}
            <Card className="lg:col-span-2 border-border/50 gradient-primary text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Learning Progress</h3>
                    <p className="text-primary-foreground/70">{stats.completedCount} of {stats.totalLessons} lessons completed</p>
                  </div>
                </div>
                <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-foreground rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-primary-foreground/70 mt-2">{stats.percentage}% complete</p>
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {coursesData
                    .filter(c => c.badge)
                    .map(course => {
                      const earned = progress.earnedBadges.includes(course.badge!);
                      return (
                        <div 
                          key={course.badge}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                            earned 
                              ? 'bg-accent/10 text-accent border border-accent/30' 
                              : 'bg-muted text-muted-foreground opacity-50'
                          }`}
                          title={earned ? `Earned: ${course.badge}` : `Locked: Complete ${course.title}`}
                        >
                          {earned ? <Trophy className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {course.badge}
                        </div>
                      );
                    })}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {progress.earnedBadges.length} of {coursesData.filter(c => c.badge).length} badges earned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="basics">
                <BookOpen className="w-4 h-4 mr-1" />
                Basics
              </TabsTrigger>
              <TabsTrigger value="saving">
                <PiggyBank className="w-4 h-4 mr-1" />
                Saving
              </TabsTrigger>
              <TabsTrigger value="investing">
                <TrendingUp className="w-4 h-4 mr-1" />
                Investing
              </TabsTrigger>
              <TabsTrigger value="planning">
                <Target className="w-4 h-4 mr-1" />
                Planning
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const courseProgress = getCourseProgress(course);
              const isCompleted = courseProgress === 100;
              const Icon = course.icon;
              
              return (
                <Card 
                  key={course.id} 
                  className="border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => startCourse(course)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={difficultyColors[course.difficulty]}>
                          {course.difficulty}
                        </Badge>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-success" />
                        )}
                      </div>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{course.lessons.length} lessons</span>
                        <span>{courseProgress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${courseProgress}%` }}
                        />
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full group-hover:bg-primary/10"
                    >
                      {isCompleted ? "Review" : courseProgress > 0 ? "Continue" : "Start Learning"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>

                    {course.badge && isCompleted && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-accent">
                          <Trophy className="w-4 h-4" />
                          Badge: {course.badge}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Coming Soon Banner */}
          <Card className="mt-8 border-border/50 bg-muted/30">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">More Courses Coming Soon!</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We're partnering with financial experts and tech companies to bring you premium content on stock trading, real estate investing, and more.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Learn;
