import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Expense, StartupInvestment, DematAccount, DailyTrade, StartupPreset, BankAccount, CustomCategory, DematTransaction } from '@/types/expense';

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<StartupInvestment[]>([]);
  const [dematAccounts, setDematAccounts] = useState<DematAccount[]>([]);
  const [dailyTrades, setDailyTrades] = useState<DailyTrade[]>([]);
  const [startupPresets, setStartupPresets] = useState<StartupPreset[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [dematTransactions, setDematTransactions] = useState<DematTransaction[]>([]);
  const [customBrokers, setCustomBrokers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [
        expensesRes,
        investmentsRes,
        dematAccountsRes,
        dailyTradesRes,
        presetsRes,
        bankAccountsRes,
        categoriesRes,
        dematTransactionsRes,
        brokersRes,
      ] = await Promise.all([
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('startup_investments').select('*').order('created_at', { ascending: false }),
        supabase.from('demat_accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('daily_trades').select('*').order('created_at', { ascending: false }),
        supabase.from('startup_presets').select('*').order('created_at', { ascending: false }),
        supabase.from('bank_accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('custom_categories').select('*').order('created_at', { ascending: false }),
        supabase.from('demat_transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('custom_brokers').select('*').order('created_at', { ascending: false }),
      ]);

      if (expensesRes.data) {
        setExpenses(expensesRes.data.map(e => ({
          id: e.id,
          amount: Number(e.amount),
          description: e.description,
          category: e.category,
          paymentMethod: e.payment_method as any,
          account: e.account as any,
          bankAccountId: e.bank_account_id || undefined,
          date: e.date,
          upiApp: e.upi_app || undefined,
          isSplit: e.is_split || false,
          splitWith: e.split_with || undefined,
          splitAmount: e.split_amount ? Number(e.split_amount) : undefined,
          createdAt: e.created_at,
        })));
      }

      if (investmentsRes.data) {
        setInvestments(investmentsRes.data.map(i => ({
          id: i.id,
          startupName: i.startup_name,
          amount: Number(i.amount),
          date: i.date,
          notes: i.notes || undefined,
          createdAt: i.created_at,
        })));
      }


      if (dematAccountsRes.data) {
        setDematAccounts(dematAccountsRes.data.map(d => ({
          id: d.id,
          brokerName: d.broker_name,
          accountId: d.account_id || undefined,
          balance: Number(d.balance),
          color: d.color,
          createdAt: d.created_at,
        })));
      }

      if (dailyTradesRes.data) {
        setDailyTrades(dailyTradesRes.data.map(t => ({
          id: t.id,
          dematAccountId: t.demat_account_id,
          date: t.date,
          pnl: Number(t.pnl),
          charges: t.charges ? Number(t.charges) : undefined,
          notes: t.notes || undefined,
          createdAt: t.created_at,
        })));
      }

      if (presetsRes.data) {
        setStartupPresets(presetsRes.data.map(p => ({
          id: p.id,
          name: p.name,
          color: p.color,
          createdAt: p.created_at,
        })));
      }

      if (bankAccountsRes.data) {
        setBankAccounts(bankAccountsRes.data.map(b => ({
          id: b.id,
          name: b.name,
          bankName: b.bank_name,
          accountNumber: b.account_number || undefined,
          balance: Number(b.balance),
          color: b.color,
          linkedPaymentMethods: (b.linked_payment_methods || []) as any[],
          createdAt: b.created_at,
        })));
      }

      if (categoriesRes.data) {
        setCustomCategories(categoriesRes.data.map(c => ({
          id: c.id,
          value: c.value,
          label: c.label,
          icon: c.icon,
          createdAt: c.created_at,
        })));
      }

      if (dematTransactionsRes.data) {
        setDematTransactions(dematTransactionsRes.data.map(t => ({
          id: t.id,
          dematAccountId: t.demat_account_id,
          type: t.type as 'deposit' | 'withdrawal',
          amount: Number(t.amount),
          notes: t.notes || undefined,
          date: t.date,
          createdAt: t.created_at,
        })));
      }

      if (brokersRes.data) {
        setCustomBrokers(brokersRes.data.map(b => b.name));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Bank Account functions
  const addBankAccount = async (account: Omit<BankAccount, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase.from('bank_accounts').insert({
      user_id: user.id,
      name: account.name,
      bank_name: account.bankName,
      account_number: account.accountNumber,
      balance: account.balance,
      color: account.color,
      linked_payment_methods: account.linkedPaymentMethods,
    }).select().single();

    if (error) {
      console.error('Error adding bank account:', error);
      return null;
    }

    const newAccount: BankAccount = {
      id: data.id,
      name: data.name,
      bankName: data.bank_name,
      accountNumber: data.account_number || undefined,
      balance: Number(data.balance),
      color: data.color,
      linkedPaymentMethods: (data.linked_payment_methods || []) as any[],
      createdAt: data.created_at,
    };

    setBankAccounts(prev => [newAccount, ...prev]);
    return newAccount;
  };

  const updateBankBalance = async (accountId: string, newBalance: number) => {
    const { error } = await supabase.from('bank_accounts')
      .update({ balance: newBalance })
      .eq('id', accountId);

    if (!error) {
      setBankAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, balance: newBalance } : acc
      ));
    }
  };

  const deleteBankAccount = async (id: string) => {
    const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
    if (!error) {
      setBankAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  // Expense functions
  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase.from('expenses').insert({
      user_id: user.id,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      payment_method: expense.paymentMethod,
      account: expense.account,
      bank_account_id: expense.bankAccountId || null,
      date: expense.date,
      upi_app: expense.upiApp || null,
      is_split: expense.isSplit || false,
      split_with: expense.splitWith || null,
      split_amount: expense.splitAmount || null,
    }).select().single();

    if (error) {
      console.error('Error adding expense:', error);
      return null;
    }

    const newExpense: Expense = {
      id: data.id,
      amount: Number(data.amount),
      description: data.description,
      category: data.category,
      paymentMethod: data.payment_method as any,
      account: data.account as any,
      bankAccountId: data.bank_account_id || undefined,
      date: data.date,
      upiApp: data.upi_app || undefined,
      isSplit: data.is_split || false,
      splitWith: data.split_with || undefined,
      splitAmount: data.split_amount ? Number(data.split_amount) : undefined,
      createdAt: data.created_at,
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Deduct from bank account if linked
    if (expense.bankAccountId) {
      const account = bankAccounts.find(a => a.id === expense.bankAccountId);
      if (account) {
        await updateBankBalance(expense.bankAccountId, account.balance - expense.amount);
      }
    }

    return newExpense;
  };

  const deleteExpense = async (id: string) => {
    const expense = expenses.find(e => e.id === id);
    
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    
    if (!error) {
      if (expense?.bankAccountId) {
        const account = bankAccounts.find(a => a.id === expense.bankAccountId);
        if (account) {
          await updateBankBalance(expense.bankAccountId, account.balance + expense.amount);
        }
      }
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  // Investment functions
  const addInvestment = async (investment: Omit<StartupInvestment, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase.from('startup_investments').insert({
      user_id: user.id,
      startup_name: investment.startupName,
      amount: investment.amount,
      date: investment.date,
      notes: investment.notes || null,
    }).select().single();

    if (error) {
      console.error('Error adding investment:', error);
      return null;
    }

    const newInvestment: StartupInvestment = {
      id: data.id,
      startupName: data.startup_name,
      amount: Number(data.amount),
      date: data.date,
      notes: data.notes || undefined,
      createdAt: data.created_at,
    };

    setInvestments(prev => [newInvestment, ...prev]);
    return newInvestment;
  };

  const deleteInvestment = async (id: string) => {
    const { error } = await supabase.from('startup_investments').delete().eq('id', id);
    if (!error) {
      setInvestments(prev => prev.filter(i => i.id !== id));
    }
  };

  const updateInvestment = async (id: string, fields: Partial<Omit<StartupInvestment, 'id' | 'createdAt'>>) => {
    if (!user) return null;

    const { data, error } = await supabase.from('startup_investments')
      .update({
        startup_name: fields.startupName,
        amount: fields.amount,
        date: fields.date,
        notes: fields.notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating investment:', error);
      return null;
    }

    const updated: StartupInvestment = {
      id: data.id,
      startupName: data.startup_name,
      amount: Number(data.amount),
      date: data.date,
      notes: data.notes || undefined,
      createdAt: data.created_at,
    };

    setInvestments(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  };

  // Demat Account functions
  const addDematAccount = async (account: Omit<DematAccount, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase.from('demat_accounts').insert({
      user_id: user.id,
      broker_name: account.brokerName,
      account_id: account.accountId || null,
      balance: account.balance,
      color: account.color,
    }).select().single();

    if (error) {
      console.error('Error adding demat account:', error);
      return null;
    }

    const newAccount: DematAccount = {
      id: data.id,
      brokerName: data.broker_name,
      accountId: data.account_id || undefined,
      balance: Number(data.balance),
      color: data.color,
      createdAt: data.created_at,
    };

    setDematAccounts(prev => [newAccount, ...prev]);
    return newAccount;
  };

  const updateDematBalance = async (accountId: string, newBalance: number) => {
    const { error } = await supabase.from('demat_accounts')
      .update({ balance: newBalance })
      .eq('id', accountId);

    if (!error) {
      setDematAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, balance: newBalance } : acc
      ));
    }
  };

  const deleteDematAccount = async (id: string) => {
    const { error } = await supabase.from('demat_accounts').delete().eq('id', id);
    if (!error) {
      setDematAccounts(prev => prev.filter(a => a.id !== id));
      setDailyTrades(prev => prev.filter(t => t.dematAccountId !== id));
    }
  };

  // Daily Trade functions
  const addDailyTrade = async (trade: Omit<DailyTrade, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase.from('daily_trades').insert({
      user_id: user.id,
      demat_account_id: trade.dematAccountId,
      date: trade.date,
      pnl: trade.pnl,
      charges: trade.charges || 0,
      notes: trade.notes || null,
    }).select().single();

    if (error) {
      console.error('Error adding daily trade:', error);
      return null;
    }

    const newTrade: DailyTrade = {
      id: data.id,
      dematAccountId: data.demat_account_id,
      date: data.date,
      pnl: Number(data.pnl),
      charges: data.charges ? Number(data.charges) : undefined,
      notes: data.notes || undefined,
      createdAt: data.created_at,
    };

    setDailyTrades(prev => [newTrade, ...prev]);

    // Update demat account balance
    const account = dematAccounts.find(a => a.id === trade.dematAccountId);
    if (account) {
      const netPnl = trade.pnl - (trade.charges || 0);
      await updateDematBalance(trade.dematAccountId, account.balance + netPnl);
    }

    return newTrade;
  };

  const deleteDailyTrade = async (id: string) => {
    const trade = dailyTrades.find(t => t.id === id);
    
    const { error } = await supabase.from('daily_trades').delete().eq('id', id);
    
    if (!error && trade) {
      const account = dematAccounts.find(a => a.id === trade.dematAccountId);
      if (account) {
        const netPnl = trade.pnl - (trade.charges || 0);
        await updateDematBalance(trade.dematAccountId, account.balance - netPnl);
      }
      setDailyTrades(prev => prev.filter(t => t.id !== id));
    }
  };

  // Startup Preset functions
  const addStartupPreset = async (preset: Omit<StartupPreset, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase.from('startup_presets').insert({
      user_id: user.id,
      name: preset.name,
      color: preset.color,
    }).select().single();

    if (error) {
      console.error('Error adding startup preset:', error);
      return null;
    }

    const newPreset: StartupPreset = {
      id: data.id,
      name: data.name,
      color: data.color,
      createdAt: data.created_at,
    };

    setStartupPresets(prev => [newPreset, ...prev]);
    return newPreset;
  };

  const deleteStartupPreset = async (id: string) => {
    const { error } = await supabase.from('startup_presets').delete().eq('id', id);
    if (!error) {
      setStartupPresets(prev => prev.filter(p => p.id !== id));
    }
  };

  // Split functionality removed

  // Custom Category functions
  const addCustomCategory = async (category: Omit<CustomCategory, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase.from('custom_categories').insert({
      user_id: user.id,
      value: category.value,
      label: category.label,
      icon: category.icon,
    }).select().single();

    if (error) {
      console.error('Error adding custom category:', error);
      return null;
    }

    const newCategory: CustomCategory = {
      id: data.id,
      value: data.value,
      label: data.label,
      icon: data.icon,
      createdAt: data.created_at,
    };

    setCustomCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const deleteCustomCategory = async (id: string) => {
    const { error } = await supabase.from('custom_categories').delete().eq('id', id);
    if (!error) {
      setCustomCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  // Custom Broker functions
  const addCustomBroker = async (broker: string) => {
    if (!user || customBrokers.includes(broker)) return;

    const { error } = await supabase.from('custom_brokers').insert({
      user_id: user.id,
      name: broker,
    });

    if (!error) {
      setCustomBrokers(prev => [...prev, broker]);
    }
  };

  const deleteCustomBroker = async (broker: string) => {
    const { error } = await supabase.from('custom_brokers')
      .delete()
      .eq('name', broker);

    if (!error) {
      setCustomBrokers(prev => prev.filter(b => b !== broker));
    }
  };

  // Demat Transaction functions
  const addDematTransaction = async (transaction: Omit<DematTransaction, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase.from('demat_transactions').insert({
      user_id: user.id,
      demat_account_id: transaction.dematAccountId,
      type: transaction.type,
      amount: transaction.amount,
      notes: transaction.notes || null,
      date: transaction.date,
    }).select().single();

    if (error) {
      console.error('Error adding demat transaction:', error);
      return null;
    }

    const newTransaction: DematTransaction = {
      id: data.id,
      dematAccountId: data.demat_account_id,
      type: data.type as 'deposit' | 'withdrawal',
      amount: Number(data.amount),
      notes: data.notes || undefined,
      date: data.date,
      createdAt: data.created_at,
    };

    setDematTransactions(prev => [newTransaction, ...prev]);

    // Update demat account balance
    const account = dematAccounts.find(a => a.id === transaction.dematAccountId);
    if (account) {
      const balanceChange = transaction.type === 'deposit' ? transaction.amount : -transaction.amount;
      await updateDematBalance(transaction.dematAccountId, account.balance + balanceChange);
    }

    return newTransaction;
  };

  const deleteDematTransaction = async (id: string) => {
    const transaction = dematTransactions.find(t => t.id === id);
    
    const { error } = await supabase.from('demat_transactions').delete().eq('id', id);
    
    if (!error && transaction) {
      const account = dematAccounts.find(a => a.id === transaction.dematAccountId);
      if (account) {
        const balanceChange = transaction.type === 'deposit' ? -transaction.amount : transaction.amount;
        await updateDematBalance(transaction.dematAccountId, account.balance + balanceChange);
      }
      setDematTransactions(prev => prev.filter(t => t.id !== id));
    }
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
    // splits removed
    dematAccounts,
    dailyTrades,
    startupPresets,
    bankAccounts,
    customCategories,
    dematTransactions,
    customBrokers,
    isLoading,
    addExpense,
    deleteExpense,
    addInvestment,
    deleteInvestment,
    updateInvestment,
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
    // split functions removed
    addCustomCategory,
    deleteCustomCategory,
    addCustomBroker,
    deleteCustomBroker,
    addDematTransaction,
    deleteDematTransaction,
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