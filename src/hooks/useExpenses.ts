import { useState, useEffect } from 'react';
import { Expense, StartupInvestment, SplitExpense, StockInvestment, StartupPreset, BankAccount } from '@/types/expense';

const EXPENSES_KEY = 'moneyflow_expenses';
const INVESTMENTS_KEY = 'moneyflow_investments';
const SPLITS_KEY = 'moneyflow_splits';
const STOCKS_KEY = 'moneyflow_stocks';
const STARTUP_PRESETS_KEY = 'moneyflow_startup_presets';
const BANK_ACCOUNTS_KEY = 'moneyflow_bank_accounts';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<StartupInvestment[]>([]);
  const [splits, setSplits] = useState<SplitExpense[]>([]);
  const [stocks, setStocks] = useState<StockInvestment[]>([]);
  const [startupPresets, setStartupPresets] = useState<StartupPreset[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedExpenses = localStorage.getItem(EXPENSES_KEY);
    const savedInvestments = localStorage.getItem(INVESTMENTS_KEY);
    const savedSplits = localStorage.getItem(SPLITS_KEY);
    const savedStocks = localStorage.getItem(STOCKS_KEY);
    const savedPresets = localStorage.getItem(STARTUP_PRESETS_KEY);
    const savedBankAccounts = localStorage.getItem(BANK_ACCOUNTS_KEY);

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
    if (savedSplits) setSplits(JSON.parse(savedSplits));
    if (savedStocks) setStocks(JSON.parse(savedStocks));
    if (savedPresets) setStartupPresets(JSON.parse(savedPresets));
    if (savedBankAccounts) setBankAccounts(JSON.parse(savedBankAccounts));
    
    setIsLoading(false);
  }, []);

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(newExpenses));
  };

  const saveInvestments = (newInvestments: StartupInvestment[]) => {
    setInvestments(newInvestments);
    localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(newInvestments));
  };

  const saveSplits = (newSplits: SplitExpense[]) => {
    setSplits(newSplits);
    localStorage.setItem(SPLITS_KEY, JSON.stringify(newSplits));
  };

  const saveStocks = (newStocks: StockInvestment[]) => {
    setStocks(newStocks);
    localStorage.setItem(STOCKS_KEY, JSON.stringify(newStocks));
  };

  const saveStartupPresets = (newPresets: StartupPreset[]) => {
    setStartupPresets(newPresets);
    localStorage.setItem(STARTUP_PRESETS_KEY, JSON.stringify(newPresets));
  };

  const saveBankAccounts = (newAccounts: BankAccount[]) => {
    setBankAccounts(newAccounts);
    localStorage.setItem(BANK_ACCOUNTS_KEY, JSON.stringify(newAccounts));
  };

  // Bank Account functions
  const addBankAccount = (account: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newAccount: BankAccount = {
      ...account,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveBankAccounts([newAccount, ...bankAccounts]);
    return newAccount;
  };

  const updateBankBalance = (accountId: string, newBalance: number) => {
    const updated = bankAccounts.map(acc => 
      acc.id === accountId ? { ...acc, balance: newBalance } : acc
    );
    saveBankAccounts(updated);
  };

  const deleteBankAccount = (id: string) => {
    saveBankAccounts(bankAccounts.filter(a => a.id !== id));
  };

  // Expense functions with bank balance deduction
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveExpenses([newExpense, ...expenses]);

    // Deduct from bank account if linked
    if (expense.bankAccountId) {
      const account = bankAccounts.find(a => a.id === expense.bankAccountId);
      if (account) {
        updateBankBalance(expense.bankAccountId, account.balance - expense.amount);
      }
    }

    return newExpense;
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense?.bankAccountId) {
      const account = bankAccounts.find(a => a.id === expense.bankAccountId);
      if (account) {
        updateBankBalance(expense.bankAccountId, account.balance + expense.amount);
      }
    }
    saveExpenses(expenses.filter(e => e.id !== id));
  };

  // Investment functions
  const addInvestment = (investment: Omit<StartupInvestment, 'id' | 'createdAt'>) => {
    const newInvestment: StartupInvestment = {
      ...investment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveInvestments([newInvestment, ...investments]);
    return newInvestment;
  };

  const deleteInvestment = (id: string) => {
    saveInvestments(investments.filter(i => i.id !== id));
  };

  // Stock functions
  const addStock = (stock: Omit<StockInvestment, 'id' | 'createdAt'>) => {
    const newStock: StockInvestment = {
      ...stock,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveStocks([newStock, ...stocks]);
    return newStock;
  };

  const deleteStock = (id: string) => {
    saveStocks(stocks.filter(s => s.id !== id));
  };

  // Startup Preset functions
  const addStartupPreset = (preset: Omit<StartupPreset, 'id' | 'createdAt'>) => {
    const newPreset: StartupPreset = {
      ...preset,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveStartupPresets([newPreset, ...startupPresets]);
    return newPreset;
  };

  const deleteStartupPreset = (id: string) => {
    saveStartupPresets(startupPresets.filter(p => p.id !== id));
  };

  // Split functions
  const addSplitExpense = (split: Omit<SplitExpense, 'id' | 'createdAt'>) => {
    const newSplit: SplitExpense = {
      ...split,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveSplits([newSplit, ...splits]);
    return newSplit;
  };

  const updateSplitPayment = (splitId: string, participantName: string, paid: boolean) => {
    const updatedSplits = splits.map(split => {
      if (split.id === splitId) {
        return {
          ...split,
          splits: split.splits.map(s => 
            s.name === participantName ? { ...s, paid } : s
          ),
        };
      }
      return split;
    });
    saveSplits(updatedSplits);
  };

  const deleteSplit = (id: string) => {
    saveSplits(splits.filter(s => s.id !== id));
  };

  // Analytics
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvestments = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalStockInvestments = stocks.reduce((sum, s) => sum + (s.quantity * s.buyPrice), 0);
  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  
  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensesByPaymentMethod = expenses.reduce((acc, e) => {
    acc[e.paymentMethod] = (acc[e.paymentMethod] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const thisMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  });

  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    expenses,
    investments,
    splits,
    stocks,
    startupPresets,
    bankAccounts,
    isLoading,
    addExpense,
    deleteExpense,
    addInvestment,
    deleteInvestment,
    addStock,
    deleteStock,
    addStartupPreset,
    deleteStartupPreset,
    addBankAccount,
    updateBankBalance,
    deleteBankAccount,
    addSplitExpense,
    updateSplitPayment,
    deleteSplit,
    totalExpenses,
    totalInvestments,
    totalStockInvestments,
    totalBankBalance,
    expensesByCategory,
    expensesByPaymentMethod,
    thisMonthExpenses,
    thisMonthTotal,
  };
}
