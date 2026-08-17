import express from 'express';
import { getLiveExchangeRates, convertCurrency } from '../services/currencyService.js';

const router = express.Router();

// @route   GET /api/currency/rates
// @desc    Get live cached exchange rates
// @access  Public
router.get('/rates', async (req, res) => {
  try {
    const rates = await getLiveExchangeRates();
    res.json({
      success: true,
      message: 'Exchange rates retrieved successfully (Cached 1h TTL)',
      rates,
      supportedCurrencies: [
        { code: 'INR', symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
        { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
        { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen' },
        { code: 'AUD', symbol: 'A$', flag: '🇦🇺', name: 'Australian Dollar' },
        { code: 'CAD', symbol: 'C$', flag: '🇨🇦', name: 'Canadian Dollar' },
        { code: 'SGD', symbol: 'S$', flag: '🇸🇬', name: 'Singapore Dollar' },
        { code: 'AED', symbol: 'AED', flag: '🇦🇪', name: 'UAE Dirham' },
        { code: 'THB', symbol: '฿', flag: '🇹🇭', name: 'Thai Baht' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/currency/convert
// @desc    Convert budget amount between currencies
// @access  Public
router.post('/convert', async (req, res) => {
  try {
    const { amount, fromCurrency = 'INR', toCurrency = 'USD' } = req.body;
    const result = await convertCurrency(amount, fromCurrency, toCurrency);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
