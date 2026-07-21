import { CategoryType } from '../types';

export interface KnownMerchant {
  name: string;
  category: CategoryType;
  logo: string;
  isRecurring: boolean;
}

export const merchantService = {
  recognizeMerchant(title: string): KnownMerchant {
    const t = title.toLowerCase();

    if (t.includes('amazon') || t.includes('amzn')) {
      return {
        name: 'Amazon India',
        category: 'Shopping',
        logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=60&auto=format&fit=crop&q=80',
        isRecurring: false,
      };
    }

    if (t.includes('swiggy') || t.includes('zomato')) {
      return {
        name: 'Swiggy Food',
        category: 'Food',
        logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=60&auto=format&fit=crop&q=80',
        isRecurring: false,
      };
    }

    if (t.includes('uber') || t.includes('ola')) {
      return {
        name: 'Uber Mobility',
        category: 'Transport',
        logo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=60&auto=format&fit=crop&q=80',
        isRecurring: false,
      };
    }

    if (t.includes('netflix')) {
      return {
        name: 'Netflix India',
        category: 'Entertainment',
        logo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=60&auto=format&fit=crop&q=80',
        isRecurring: true,
      };
    }

    return {
      name: title || 'Merchant',
      category: 'Other',
      logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=60&auto=format&fit=crop&q=80',
      isRecurring: false,
    };
  }
};
