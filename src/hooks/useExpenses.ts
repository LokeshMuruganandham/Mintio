import { useState, useEffect } from 'react';
import { Expense, StartupInvestment, SplitExpense } from '@/types/expense';

const EXPENSES_KEY = 'moneyflow_expenses';
const INVESTMENTS_KEY = 'moneyflow_investments';
const SPLITS_KEY = 'moneyflow_splits';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<StartupInvestment[]>([]);
  const [splits, setSplits] = useState<SplitExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedExpenses = localStorage.getItem(EXPENSES_KEY);
    const savedInvestments = localStorage.getItem(INVESTMENTS_KEY);
    const savedSplits = localStorage.getItem(SPLITS_KEY);

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
    if (savedSplits) setSplits(JSON.parse(savedSplits));
    
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

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveExpenses([newExpense, ...expenses]);
    return newExpense;
  };

  const deleteExpense = (id: string) => {
    saveExpenses(expenses.filter(e => e.id !== id));
  };

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
    isLoading,
    addExpense,
    deleteExpense,
    addInvestment,
    deleteInvestment,
    addSplitExpense,
    updateSplitPayment,
    deleteSplit,
    totalExpenses,
    totalInvestments,
    expensesByCategory,
    expensesByPaymentMethod,
    thisMonthExpenses,
    thisMonthTotal,
  };
}
