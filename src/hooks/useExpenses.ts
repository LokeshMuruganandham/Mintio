import { useState, useEffect } from 'react';
import { Expense, StartupInvestment, SplitExpense, DematAccount, DailyTrade, StartupPreset, BankAccount } from '@/types/expense';

const EXPENSES_KEY = 'moneyflow_expenses';
const INVESTMENTS_KEY = 'moneyflow_investments';
const SPLITS_KEY = 'moneyflow_splits';
const DEMAT_ACCOUNTS_KEY = 'moneyflow_demat_accounts';
const DAILY_TRADES_KEY = 'moneyflow_daily_trades';
const STARTUP_PRESETS_KEY = 'moneyflow_startup_presets';
const BANK_ACCOUNTS_KEY = 'moneyflow_bank_accounts';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<StartupInvestment[]>([]);
  const [splits, setSplits] = useState<SplitExpense[]>([]);
  const [dematAccounts, setDematAccounts] = useState<DematAccount[]>([]);
  const [dailyTrades, setDailyTrades] = useState<DailyTrade[]>([]);
  const [startupPresets, setStartupPresets] = useState<StartupPreset[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedExpenses = localStorage.getItem(EXPENSES_KEY);
    const savedInvestments = localStorage.getItem(INVESTMENTS_KEY);
    const savedSplits = localStorage.getItem(SPLITS_KEY);
    const savedDematAccounts = localStorage.getItem(DEMAT_ACCOUNTS_KEY);
    const savedDailyTrades = localStorage.getItem(DAILY_TRADES_KEY);
    const savedPresets = localStorage.getItem(STARTUP_PRESETS_KEY);
    const savedBankAccounts = localStorage.getItem(BANK_ACCOUNTS_KEY);

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
    if (savedSplits) setSplits(JSON.parse(savedSplits));
    if (savedDematAccounts) setDematAccounts(JSON.parse(savedDematAccounts));
    if (savedDailyTrades) setDailyTrades(JSON.parse(savedDailyTrades));
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

  const saveDematAccounts = (newAccounts: DematAccount[]) => {
    setDematAccounts(newAccounts);
    localStorage.setItem(DEMAT_ACCOUNTS_KEY, JSON.stringify(newAccounts));
  };

  const saveDailyTrades = (newTrades: DailyTrade[]) => {
    setDailyTrades(newTrades);
    localStorage.setItem(DAILY_TRADES_KEY, JSON.stringify(newTrades));
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

  // Demat Account functions
  const addDematAccount = (account: Omit<DematAccount, 'id' | 'createdAt'>) => {
    const newAccount: DematAccount = {
      ...account,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveDematAccounts([newAccount, ...dematAccounts]);
    return newAccount;
  };

  const updateDematBalance = (accountId: string, newBalance: number) => {
    const updated = dematAccounts.map(acc => 
      acc.id === accountId ? { ...acc, balance: newBalance } : acc
    );
    saveDematAccounts(updated);
  };

  const deleteDematAccount = (id: string) => {
    saveDematAccounts(dematAccounts.filter(a => a.id !== id));
    // Also delete related trades
    saveDailyTrades(dailyTrades.filter(t => t.dematAccountId !== id));
  };

  // Daily Trade functions
  const addDailyTrade = (trade: Omit<DailyTrade, 'id' | 'createdAt'>) => {
    const newTrade: DailyTrade = {
      ...trade,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveDailyTrades([newTrade, ...dailyTrades]);
    
    // Update demat account balance
    const account = dematAccounts.find(a => a.id === trade.dematAccountId);
    if (account) {
      const netPnl = trade.pnl - (trade.charges || 0);
      updateDematBalance(trade.dematAccountId, account.balance + netPnl);
    }
    
    return newTrade;
  };

  const deleteDailyTrade = (id: string) => {
    const trade = dailyTrades.find(t => t.id === id);
    if (trade) {
      const account = dematAccounts.find(a => a.id === trade.dematAccountId);
      if (account) {
        const netPnl = trade.pnl - (trade.charges || 0);
        updateDematBalance(trade.dematAccountId, account.balance - netPnl);
      }
    }
    saveDailyTrades(dailyTrades.filter(t => t.id !== id));
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
  const totalDematBalance = dematAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalTradingPnl = dailyTrades.reduce((sum, t) => sum + t.pnl - (t.charges || 0), 0);
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
    dematAccounts,
    dailyTrades,
    startupPresets,
    bankAccounts,
    isLoading,
    addExpense,
    deleteExpense,
    addInvestment,
    deleteInvestment,
    addDematAccount,
    updateDematBalance,
    deleteDematAccount,
    addDailyTrade,
    deleteDailyTrade,
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
    totalDematBalance,
    totalTradingPnl,
    totalBankBalance,
    expensesByCategory,
    expensesByPaymentMethod,
    thisMonthExpenses,
    thisMonthTotal,
  };
}
