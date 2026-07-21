import { ReceiptOCRResult, CategoryType, PaymentMethod } from '../types';

export const ocrService = {
  async scanReceipt(file: File | string): Promise<ReceiptOCRResult> {
    // Simulate OCR text extraction delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const fileName = typeof file === 'string' ? file.toLowerCase() : file.name.toLowerCase();

    if (fileName.includes('amazon') || fileName.includes('invoice')) {
      return {
        merchantName: 'Amazon Retail India',
        totalAmount: 1849,
        subtotal: 1566,
        taxAmount: 283,
        discount: 0,
        date: new Date().toISOString().split('T')[0],
        category: 'Shopping',
        paymentMethod: 'Credit Card',
        confidenceScore: 98,
        items: [
          { name: 'Wireless Ergonomic Mouse', price: 1299 },
          { name: 'USB-C Cable Braided 2m', price: 550 },
        ],
      };
    }

    if (fileName.includes('swiggy') || fileName.includes('zomato') || fileName.includes('food')) {
      return {
        merchantName: 'Swiggy Gourmet',
        totalAmount: 640,
        subtotal: 540,
        taxAmount: 40,
        discount: 60,
        date: new Date().toISOString().split('T')[0],
        category: 'Food',
        paymentMethod: 'UPI',
        confidenceScore: 95,
        items: [
          { name: 'Paneer Butter Masala', price: 340 },
          { name: 'Butter Naan (2x)', price: 120 },
          { name: 'Gulab Jamun', price: 80 },
        ],
      };
    }

    // Generic fallback OCR result
    return {
      merchantName: 'Reliance Digital',
      totalAmount: 2499,
      subtotal: 2117,
      taxAmount: 382,
      discount: 0,
      date: new Date().toISOString().split('T')[0],
      category: 'Shopping',
      paymentMethod: 'UPI',
      confidenceScore: 92,
      items: [
        { name: 'Electronic Accessory Item', price: 2499 },
      ],
    };
  }
};
