// AI Service for Paisa Buddy
// Uses OpenRouter API for financial insights

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free';

export interface FinancialSnapshot {
  totals: {
    income: number;
    expenses: number;
    net: number;
    savingsRate: number;
  };
  highestCategory: { category: string; amount: number } | null;
  topDay: { day: string; amount: number } | null;
  recent: Array<{
    name: string;
    category: string;
    amount: number;
    date: string;
  }>;
  goals?: Array<{
    name: string;
    current: number;
    target: number;
    progress: number;
  }>;
  budgets?: Array<{
    category: string;
    limit: number;
    spent: number;
    percentUsed: number;
  }>;
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  warnings: string[];
  opportunities: string[];
}

const getApiKey = () => import.meta.env.VITE_OPENROUTER_API_KEY;

export const isAIConfigured = () => Boolean(getApiKey());

const buildFinancialPrompt = (snapshot: FinancialSnapshot): string => {
  return `You are a friendly and knowledgeable Indian financial advisor named "पैसा Buddy AI". Analyze this user's financial data and provide personalized insights in a warm, encouraging tone.

## User's Financial Snapshot (amounts in INR ₹):

**Monthly Overview:**
- Total Income: ₹${snapshot.totals.income.toLocaleString('en-IN')}
- Total Expenses: ₹${snapshot.totals.expenses.toLocaleString('en-IN')}
- Net Savings: ₹${snapshot.totals.net.toLocaleString('en-IN')}
- Savings Rate: ${snapshot.totals.savingsRate}%

${snapshot.highestCategory ? `**Top Spending Category:** ${snapshot.highestCategory.category} (₹${snapshot.highestCategory.amount.toLocaleString('en-IN')})` : ''}

${snapshot.topDay ? `**Highest Spending Day:** ${snapshot.topDay.day} (₹${snapshot.topDay.amount.toLocaleString('en-IN')})` : ''}

**Recent Transactions (last 20):**
${snapshot.recent.map(t => `- ${t.name}: ₹${t.amount.toLocaleString('en-IN')} (${t.category})`).join('\n')}

${snapshot.goals?.length ? `
**Savings Goals:**
${snapshot.goals.map(g => `- ${g.name}: ₹${g.current.toLocaleString('en-IN')} / ₹${g.target.toLocaleString('en-IN')} (${g.progress}% complete)`).join('\n')}
` : ''}

${snapshot.budgets?.length ? `
**Budget Status:**
${snapshot.budgets.map(b => `- ${b.category}: ₹${b.spent.toLocaleString('en-IN')} / ₹${b.limit.toLocaleString('en-IN')} (${b.percentUsed}% used)`).join('\n')}
` : ''}

---

Please provide a comprehensive financial analysis with:

1. **Summary** (2-3 sentences): Overall financial health assessment
2. **Key Recommendations** (3-4 bullet points): Actionable advice to improve finances
3. **Warnings** (1-2 bullet points): Any concerning patterns or risks
4. **Opportunities** (2-3 bullet points): Ways to save more or grow wealth

Use Indian financial context (mention SIP, PPF, NPS, mutual funds where relevant). Be encouraging but honest. Include specific numbers from the data. Use simple language suitable for someone new to personal finance.

IMPORTANT: Return ONLY valid JSON without any markdown code blocks or extra text. Use this exact format:
{"summary": "Your overall assessment here", "recommendations": ["Recommendation 1", "Recommendation 2"], "warnings": ["Warning 1"], "opportunities": ["Opportunity 1"]}`;
};

const buildQuickInsightPrompt = (question: string, snapshot: FinancialSnapshot): string => {
  return `You are पैसा Buddy AI, a friendly Indian financial advisor. Answer this question based on the user's financial data.

User's Question: "${question}"

Financial Context (INR):
- Income: ₹${snapshot.totals.income.toLocaleString('en-IN')}
- Expenses: ₹${snapshot.totals.expenses.toLocaleString('en-IN')}
- Net: ₹${snapshot.totals.net.toLocaleString('en-IN')}
- Savings Rate: ${snapshot.totals.savingsRate}%
${snapshot.highestCategory ? `- Top Category: ${snapshot.highestCategory.category} (₹${snapshot.highestCategory.amount.toLocaleString('en-IN')})` : ''}

Provide a concise, helpful answer (2-4 sentences) with specific advice. Use ₹ for currency. Do not format as JSON - just respond in plain conversational text.`;
};

export async function generateFinancialInsights(snapshot: FinancialSnapshot): Promise<AIInsight> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured. Add VITE_OPENROUTER_API_KEY to your .env file.');
  }

  if (!snapshot.recent.length) {
    throw new Error('No transaction data available. Add some transactions to get AI insights.');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Paisa Buddy',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'user', content: buildFinancialPrompt(snapshot) }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('OpenRouter API error:', error);
    
    if (response.status === 429) {
      throw new Error('Rate limit reached. Please wait a minute and try again.');
    }
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OpenRouter API key.');
    }
    
    throw new Error(error.error?.message || 'Failed to generate insights. Please try again.');
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('No response from AI. Please try again.');
  }

  // Parse JSON from response (handle markdown code blocks)
  try {
    // Remove markdown code block wrappers if present
    let cleanText = text.trim();
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || '',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
      };
    }
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', e, 'Raw text:', text);
  }

  // Fallback: extract text content without JSON formatting
  let cleanSummary = text.trim();
  // Remove any JSON-like structures from the summary
  cleanSummary = cleanSummary.replace(/[\{\}\[\]",]/g, ' ').replace(/\s+/g, ' ').trim();
  
  return {
    summary: cleanSummary || 'Analysis complete. Check your spending patterns above.',
    recommendations: [],
    warnings: [],
    opportunities: [],
  };
}

export async function askFinancialQuestion(question: string, snapshot: FinancialSnapshot): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured.');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Paisa Buddy',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'user', content: buildQuickInsightPrompt(question, snapshot) }
      ],
      temperature: 0.7,
      max_tokens: 256,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit reached. Please wait a minute and try again.');
    }
    throw new Error('Failed to get answer. Please try again.');
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  return text?.trim() || 'Sorry, I could not generate an answer. Please try again.';
}

// Predefined quick insights that don't need API calls
export function getLocalInsights(snapshot: FinancialSnapshot): string[] {
  const insights: string[] = [];

  // Savings rate insight
  if (snapshot.totals.savingsRate >= 30) {
    insights.push(`🌟 Excellent! Your ${snapshot.totals.savingsRate}% savings rate is above the recommended 20%. Keep it up!`);
  } else if (snapshot.totals.savingsRate >= 20) {
    insights.push(`👍 Good job! Your ${snapshot.totals.savingsRate}% savings rate meets the recommended target.`);
  } else if (snapshot.totals.savingsRate > 0) {
    insights.push(`💡 Your savings rate is ${snapshot.totals.savingsRate}%. Try to reach 20% by cutting discretionary spending.`);
  } else {
    insights.push(`⚠️ You're spending more than you earn. Review your expenses to find areas to cut.`);
  }

  // Top spending insight
  if (snapshot.highestCategory) {
    const percent = Math.round((snapshot.highestCategory.amount / snapshot.totals.expenses) * 100);
    insights.push(`📊 ${snapshot.highestCategory.category} is your biggest expense (${percent}% of total). Is this aligned with your priorities?`);
  }

  // Weekend spending pattern
  if (snapshot.topDay?.day === 'Sat' || snapshot.topDay?.day === 'Sun') {
    insights.push(`📅 You spend most on weekends. Consider planning weekend activities that cost less.`);
  }

  // Income vs expense ratio
  if (snapshot.totals.income > 0) {
    const ratio = snapshot.totals.expenses / snapshot.totals.income;
    if (ratio > 0.9) {
      insights.push(`🔴 You're using ${Math.round(ratio * 100)}% of income on expenses. Build an emergency buffer.`);
    } else if (ratio > 0.7) {
      insights.push(`🟡 ${Math.round(ratio * 100)}% of income goes to expenses. Good, but there's room to save more.`);
    }
  }

  return insights;
}
