import { CategoryType } from '../types';

interface MerchantRule {
  pattern: RegExp;
  merchantName: string;
  category: CategoryType;
}

const merchantRules: MerchantRule[] = [
  { pattern: /AMAZON|AMZN|AWS/i, merchantName: 'Amazon Retail', category: 'Shopping' },
  { pattern: /SWIGGY|ZOMATO|DUNZO/i, merchantName: 'Swiggy / Zomato', category: 'Food' },
  { pattern: /UBER|OLA|RAPIDO/i, merchantName: 'Uber / Ola Cabs', category: 'Transport' },
  { pattern: /NETFLIX/i, merchantName: 'Netflix', category: 'Entertainment' },
  { pattern: /SPOTIFY/i, merchantName: 'Spotify', category: 'Entertainment' },
  { pattern: /BIGBASKET|BLINKIT|ZEPTO|INSTAMART|NATURE/i, merchantName: 'Blinkit / BigBasket', category: 'Food' },
  { pattern: /JIO|AIRTEL|VI\b|ACT\b/i, merchantName: 'Jio / Airtel Telecom', category: 'Bills' },
  { pattern: /ZERODHA|GROWW|KITE|UPSTOX|MUTUAL/i, merchantName: 'Zerodha / Investment', category: 'Investment' },
  { pattern: /STARBUCKS|THIRD WAVE|BLUE TOKAI|CCD/i, merchantName: 'Starbucks Coffee', category: 'Food' },
  { pattern: /ZARA|H&M|UNIQLO|MYNTRA|AJIO/i, merchantName: 'Zara / Fashion', category: 'Shopping' },
  { pattern: /PVR|INOX|CINEPOLIS|BOOKMYSHOW/i, merchantName: 'PVR Cinemas', category: 'Entertainment' },
  { pattern: /APOLLO|PHARMEASY|1MG|MEDPLUS/i, merchantName: 'Apollo Healthcare', category: 'Healthcare' },
  { pattern: /COURSERA|UDEMY|UNACADEMY|BYJU/i, merchantName: 'Coursera / Education', category: 'Education' },
  { pattern: /INDIGO|AIR INDIA|AKASA|MAKEMYTRIP/i, merchantName: 'IndiGo Airlines', category: 'Travel' },
  { pattern: /SALARY|PAYROLL|DIRECT DEP/i, merchantName: 'Employer Salary Deposit', category: 'Salary' },
  { pattern: /UPWORK|FIVERR|FREELANCE/i, merchantName: 'Freelance Payout', category: 'Freelance' },
];

export function autoCategorizeMerchant(rawDescription: string): {
  merchant: string;
  category: CategoryType;
} {
  for (const rule of merchantRules) {
    if (rule.pattern.test(rawDescription)) {
      return {
        merchant: rule.merchantName,
        category: rule.category,
      };
    }
  }

  // Fallback heuristic
  const cleanTitle = rawDescription.trim();
  return {
    merchant: cleanTitle || 'Merchant Store',
    category: 'Other',
  };
}
