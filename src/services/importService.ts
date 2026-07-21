import { CategoryType, PaymentMethod, Transaction, TransactionType } from '../types';
import { autoCategorizeMerchant } from '../utils/merchantRules';
import { transactionService } from './transactionService';

export interface ParsedImportItem {
  tempId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
  merchant: string;
  paymentMethod: PaymentMethod;
  date: string;
  notes: string;
  isDuplicate?: boolean;
  duplicateResolution?: 'Skip' | 'Replace' | 'Keep';
  existingMatchId?: string;
}

export interface ImportBatchRecord {
  id: string;
  date: string;
  source: 'CSV' | 'PDF' | 'SMS' | 'Notification' | 'Gmail';
  fileName?: string;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
}

export const importService = {
  // Parse CSV text content
  parseCSVText(csvText: string): ParsedImportItem[] {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const items: ParsedImportItem[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) continue;

      const dateStr = parts[0] || new Date().toISOString().split('T')[0];
      const desc = parts[1] || 'Imported Line Item';
      const rawAmount = parseFloat(parts[2]) || 0;
      const txType: TransactionType = parts[3]?.toLowerCase() === 'income' ? 'income' : 'expense';

      const auto = autoCategorizeMerchant(desc);

      items.push({
        tempId: `import-${Date.now()}-${i}`,
        title: desc,
        amount: Math.abs(rawAmount),
        type: txType,
        category: auto.category,
        merchant: auto.merchant,
        paymentMethod: (parts[4] as PaymentMethod) || 'UPI',
        date: dateStr,
        notes: parts[5] || 'Imported via CSV statement',
        duplicateResolution: 'Skip',
      });
    }

    return items;
  },

  // Mock PDF Bank Statement Parser (Extracts simulated statement line items)
  parsePDFBankStatement(fileName: string): ParsedImportItem[] {
    const today = new Date().toISOString().split('T')[0];

    const mockExtractedLines = [
      { desc: 'AMZN Mktp IN Retail Bangalore', amount: 3490, type: 'expense' as TransactionType, date: today, pm: 'Credit Card' as PaymentMethod },
      { desc: 'SWIGGY FOOD DELIVERY BANGER', amount: 620, type: 'expense' as TransactionType, date: today, pm: 'UPI' as PaymentMethod },
      { desc: 'UBER RIDE PREMIER APEX TECH', amount: 480, type: 'expense' as TransactionType, date: today, pm: 'UPI' as PaymentMethod },
      { desc: 'ACME CONSULTING FREELANCE PAY', amount: 25000, type: 'income' as TransactionType, date: today, pm: 'Net Banking' as PaymentMethod },
      { desc: 'BLINKIT GROCERY STORE INSTANT', amount: 1250, type: 'expense' as TransactionType, date: today, pm: 'UPI' as PaymentMethod },
    ];

    return mockExtractedLines.map((line, idx) => {
      const auto = autoCategorizeMerchant(line.desc);
      return {
        tempId: `pdf-${Date.now()}-${idx}`,
        title: line.desc,
        amount: line.amount,
        type: line.type,
        category: auto.category,
        merchant: auto.merchant,
        paymentMethod: line.pm,
        date: line.date,
        notes: `Extracted from PDF bank statement (${fileName})`,
        duplicateResolution: 'Skip',
      };
    });
  },

  // Flag Duplicates against existing transactions
  flagDuplicates(existingTxs: Transaction[], incoming: ParsedImportItem[]): ParsedImportItem[] {
    return incoming.map((item) => {
      const match = existingTxs.find(
        (e) =>
          e.amount === item.amount &&
          e.date === item.date &&
          (e.merchant.toLowerCase().includes(item.merchant.toLowerCase()) ||
            item.merchant.toLowerCase().includes(e.merchant.toLowerCase()) ||
            e.title.toLowerCase().includes(item.title.toLowerCase()))
      );

      if (match) {
        return {
          ...item,
          isDuplicate: true,
          existingMatchId: match.id,
          duplicateResolution: 'Skip',
        };
      }
      return item;
    });
  },

  // Execute Import Batch to Firestore
  async executeImportBatch(
    uid: string,
    items: ParsedImportItem[],
    source: 'CSV' | 'PDF' | 'SMS' | 'Notification' | 'Gmail',
    fileName?: string
  ): Promise<ImportBatchRecord> {
    let importedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const item of items) {
      if (item.isDuplicate && item.duplicateResolution === 'Skip') {
        skippedCount++;
        continue;
      }

      try {
        if (item.isDuplicate && item.duplicateResolution === 'Replace' && item.existingMatchId) {
          await transactionService.updateTransaction(item.existingMatchId, {
            title: item.title,
            amount: item.amount,
            type: item.type,
            category: item.category,
            merchant: item.merchant,
            paymentMethod: item.paymentMethod,
            date: item.date,
            notes: item.notes,
          });
          importedCount++;
        } else {
          // Add new entry
          await transactionService.addTransaction(uid, {
            title: item.title,
            amount: item.amount,
            type: item.type,
            category: item.category,
            merchant: item.merchant,
            paymentMethod: item.paymentMethod,
            date: item.date,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            notes: item.notes,
            status: 'Completed',
          });
          importedCount++;
        }
      } catch (err) {
        console.warn('Import item failed:', err);
        failedCount++;
      }
    }

    const record: ImportBatchRecord = {
      id: `imp-${Date.now()}`,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source,
      fileName,
      importedCount,
      skippedCount,
      failedCount,
    };

    // Save to local history log
    const savedLogs = localStorage.getItem('pocketpilot_import_history');
    const logs: ImportBatchRecord[] = savedLogs ? JSON.parse(savedLogs) : [];
    localStorage.setItem('pocketpilot_import_history', JSON.stringify([record, ...logs]));

    return record;
  },

  getImportHistory(): ImportBatchRecord[] {
    const savedLogs = localStorage.getItem('pocketpilot_import_history');
    if (!savedLogs) {
      return [
        {
          id: 'imp-seed-1',
          date: '2026-07-21 10:15 AM',
          source: 'PDF',
          fileName: 'HDFC_Bank_Statement_July2026.pdf',
          importedCount: 5,
          skippedCount: 1,
          failedCount: 0,
        },
        {
          id: 'imp-seed-2',
          date: '2026-07-20 04:30 PM',
          source: 'CSV',
          fileName: 'credit_card_july.csv',
          importedCount: 12,
          skippedCount: 2,
          failedCount: 0,
        },
      ];
    }
    return JSON.parse(savedLogs);
  }
};
