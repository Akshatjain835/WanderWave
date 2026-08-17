import axios from 'axios';

// In-Memory Exchange Rate Cache with 1-Hour TTL & Fallback Safety Net
let ratesCache = {
  timestamp: 0,
  base: 'USD',
  rates: {
    USD: 1.0,
    INR: 83.75,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 155.20,
    AUD: 1.52,
    CAD: 1.36,
    SGD: 1.35,
    AED: 3.67,
    THB: 36.50,
  },
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour Cache TTL

export const FALLBACK_RATES = {
  USD: 1.0,
  INR: 83.75,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 155.20,
  AUD: 1.52,
  CAD: 1.36,
  SGD: 1.35,
  AED: 3.67,
  THB: 36.50,
};

/**
 * Fetches live exchange rates with caching, stale rate safety net & fallback recovery.
 */
export const getLiveExchangeRates = async () => {
  const now = Date.now();

  // Return cached rates if fresh (within 1 hour)
  if (ratesCache.rates && (now - ratesCache.timestamp) < CACHE_TTL_MS) {
    return ratesCache.rates;
  }

  try {
    const response = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 4000 });
    if (response.data && response.data.result === 'success' && response.data.rates) {
      ratesCache = {
        timestamp: now,
        base: 'USD',
        rates: {
          USD: 1.0,
          INR: response.data.rates.INR || FALLBACK_RATES.INR,
          EUR: response.data.rates.EUR || FALLBACK_RATES.EUR,
          GBP: response.data.rates.GBP || FALLBACK_RATES.GBP,
          JPY: response.data.rates.JPY || FALLBACK_RATES.JPY,
          AUD: response.data.rates.AUD || FALLBACK_RATES.AUD,
          CAD: response.data.rates.CAD || FALLBACK_RATES.CAD,
          SGD: response.data.rates.SGD || FALLBACK_RATES.SGD,
          AED: response.data.rates.AED || FALLBACK_RATES.AED,
          THB: response.data.rates.THB || FALLBACK_RATES.THB,
        },
      };
      console.log('  ✓ [CurrencyService] Refreshed live exchange rates from API:', ratesCache.rates);
      return ratesCache.rates;
    }
  } catch (error) {
    console.warn('  ⚠️ [CurrencyService Warning] Live Exchange Rate API failed/timeout. Utilizing cached or fallback rates.', error.message);
  }

  // Use existing cached rates or fallback rates
  return ratesCache.rates || FALLBACK_RATES;
};

/**
 * Utility to format currency values cleanly according to target currency.
 */
export const roundCurrency = (amount, currency = 'USD') => {
  if (currency.toUpperCase() === 'JPY') {
    return Math.round(amount);
  }
  return Math.round(amount * 100) / 100;
};

/**
 * Converts an amount from one currency to another using USD base normalization.
 */
export const convertCurrency = async (amount, fromCurrency = 'INR', toCurrency = 'USD') => {
  const numAmount = Number(amount) || 0;
  const rates = await getLiveExchangeRates();

  const fromRate = rates[fromCurrency.toUpperCase()] || rates['INR'];
  const toRate = rates[toCurrency.toUpperCase()] || rates['USD'];

  // Convert to USD base first, then convert to target currency
  const amountInUSD = numAmount / fromRate;
  const convertedAmount = amountInUSD * toRate;

  return {
    originalAmount: numAmount,
    fromCurrency: fromCurrency.toUpperCase(),
    convertedAmount: roundCurrency(convertedAmount, toCurrency),
    toCurrency: toCurrency.toUpperCase(),
    rateUsed: roundCurrency(toRate / fromRate, toCurrency),
  };
};
