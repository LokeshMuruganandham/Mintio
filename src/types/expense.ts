export type PaymentMethod = 'upi' | 'card' | 'cash' | 'bank_transfer' | 'wallet';

export type ExpenseCategory = 
  | 'food' 
  | 'transport' 
  | 'shopping' 
  | 'entertainment' 
  | 'bills' 
  | 'health' 
  | 'education' 
  | 'travel' 
  | 'other'
  | string; // Allow custom categories

export type AccountType = 'personal' | 'business' | 'savings' | 'credit';

export type DematTransactionType = 'deposit' | 'withdrawal';

export interface DematTransaction {
  id: string;
  dematAccountId: string;
  type: DematTransactionType;
  amount: number;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface CustomCategory {
  id: string;
  value: string;
  label: string;
  icon: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber?: string;
  balance: number;
  color: string;
  linkedPaymentMethods: PaymentMethod[];
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paymentMethod: PaymentMethod;
  account: AccountType;
  bankAccountId?: string;
  date: string;
  upiApp?: string;
  isSplit?: boolean;
  splitWith?: string[];
  splitAmount?: number;
  createdAt: string;
}

export interface StartupInvestment {
  id: string;
  startupName: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface DematAccount {
  id: string;
  brokerName: string;
  accountId?: string;
  balance: number;
  color: string;
  createdAt: string;
}

export interface DailyTrade {
  id: string;
  dematAccountId: string;
  date: string;
  pnl: number; // positive for profit, negative for loss
  charges?: number;
  notes?: string;
  createdAt: string;
}

export interface StartupPreset {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface SplitExpense {
  id: string;
  totalAmount: number;
  description: string;
  participants: string[];
  paidBy: string;
  splitType: 'equal' | 'custom';
  splits: { name: string; amount: number; paid: boolean }[];
  date: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'card', label: 'Card', icon: '💳' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'wallet', label: 'Wallet', icon: '👛' },
];

export const UPI_APPS = [
  'Google Pay',
  'PhonePe',
  'Paytm',
  'Amazon Pay',
  'BHIM',
  'Other',
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'food', label: 'Food & Dining', icon: '🍔' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'bills', label: 'Bills & Utilities', icon: '📄' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit Card' },
];

export const STARTUP_PRESET_COLORS = [
  '#6B7280', '#9CA3AF', '#4B5563', '#374151', '#1F2937', '#111827',
];

export const BANK_COLORS = [
  '#6B7280', '#9CA3AF', '#4B5563', '#374151', '#1F2937', '#111827',
];

export const DEMAT_COLORS = [
  '#6B7280', '#9CA3AF', '#4B5563', '#374151', '#1F2937', '#111827',
];

export const BROKER_PRESETS = [
  'Zerodha',
  'Groww',
  'Upstox',
  'Angel One',
  'ICICI Direct',
  'HDFC Securities',
  'Kotak Securities',
  'Dhan',
  '5paisa',
  'Motilal Oswal',
  'Sharekhan',
  'Axis Direct',
  'SBI Securities',
  'Edelweiss',
  'IIFL Securities',
  'Religare',
  'Geojit',
  'Karvy',
  'Fyers',
  'Paytm Money',
  'INDmoney',
  'Samco',
  'Alice Blue',
  'Trade Smart',
  'Prostocks',
];

export const CATEGORY_ICONS = [
  '🍔', '🚗', '🛍️', '🎬', '📄', '🏥', '📚', '✈️', '📦',
  '🏠', '💊', '🎮', '🍕', '☕', '🎁', '💇', '🐾', '👶',
  '🏋️', '🎵', '📱', '💻', '🔧', '🌿', '✨',
];
