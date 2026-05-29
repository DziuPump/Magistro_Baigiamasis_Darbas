// pricing.js
export const MODEL_PRICING = {
  "gpt-5.2": {
    tier: "standard",
    inputPer1M: 1.75,
    outputPer1M: 14.0,
    cachedInputPer1M: 0.175,
    currency: "USD",
    source: "OpenAI gpt-5.2 pricing (Jan 2026)",
  },
  "gpt-4.1": {
    tier: "standard",
    inputPer1M: 2.0,
    outputPer1M: 8.0,
    currency: "USD",
    source: "OpenAI gpt-4.1 pricing (Jan 2026)",
  },
  "gemini-3-pro-preview": {
    tier: "preview",
    inputPer1M: 2.0,
    outputPer1M: 12.0,
    currency: "USD",
    source: "Google Gemini 3 Pro pricing (Jan 2026)",
  },
  "gemini-2.5-flash": {
    tier: "flash",
    inputPer1M: 0.3,
    outputPer1M: 2.5,
    currency: "USD",
    source: "Google Gemini 2.5 flash pricing (Jan 2026)",
  },
  "llama-3.3-70b-versatile": {
    tier: "versatile",
    inputPer1M: 0.59, // kaina uz 1M input token (iš Groq)
    outputPer1M: 0.79, // kaina uz 1M output token (iš Groq)
    currency: "USD",
    source: "Groq Pricing for LLaMA 3.3 70B (Jan 2026)",
  },
};
