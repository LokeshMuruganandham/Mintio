-- Bank Accounts table
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT,
  balance NUMERIC NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6B7280',
  linked_payment_methods TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bank accounts" ON public.bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bank accounts" ON public.bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bank accounts" ON public.bank_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bank accounts" ON public.bank_accounts FOR DELETE USING (auth.uid() = user_id);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  account TEXT NOT NULL,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  upi_app TEXT,
  is_split BOOLEAN DEFAULT false,
  split_with TEXT[],
  split_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Startup Investments table
CREATE TABLE public.startup_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  startup_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.startup_investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own investments" ON public.startup_investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own investments" ON public.startup_investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investments" ON public.startup_investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investments" ON public.startup_investments FOR DELETE USING (auth.uid() = user_id);

-- Startup Presets table
CREATE TABLE public.startup_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.startup_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own presets" ON public.startup_presets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own presets" ON public.startup_presets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own presets" ON public.startup_presets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own presets" ON public.startup_presets FOR DELETE USING (auth.uid() = user_id);

-- Demat Accounts table
CREATE TABLE public.demat_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  broker_name TEXT NOT NULL,
  account_id TEXT,
  balance NUMERIC NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.demat_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own demat accounts" ON public.demat_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own demat accounts" ON public.demat_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own demat accounts" ON public.demat_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own demat accounts" ON public.demat_accounts FOR DELETE USING (auth.uid() = user_id);

-- Daily Trades table
CREATE TABLE public.daily_trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  demat_account_id UUID NOT NULL REFERENCES public.demat_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  pnl NUMERIC NOT NULL,
  charges NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trades" ON public.daily_trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trades" ON public.daily_trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trades" ON public.daily_trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trades" ON public.daily_trades FOR DELETE USING (auth.uid() = user_id);

-- Demat Transactions table
CREATE TABLE public.demat_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  demat_account_id UUID NOT NULL REFERENCES public.demat_accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount NUMERIC NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.demat_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own demat transactions" ON public.demat_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own demat transactions" ON public.demat_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own demat transactions" ON public.demat_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own demat transactions" ON public.demat_transactions FOR DELETE USING (auth.uid() = user_id);

-- Split Expenses table
CREATE TABLE public.split_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  participants TEXT[] NOT NULL,
  paid_by TEXT NOT NULL,
  split_type TEXT NOT NULL CHECK (split_type IN ('equal', 'custom')),
  splits JSONB NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.split_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own split expenses" ON public.split_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own split expenses" ON public.split_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own split expenses" ON public.split_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own split expenses" ON public.split_expenses FOR DELETE USING (auth.uid() = user_id);

-- Custom Categories table
CREATE TABLE public.custom_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories" ON public.custom_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON public.custom_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.custom_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.custom_categories FOR DELETE USING (auth.uid() = user_id);

-- Custom Brokers table
CREATE TABLE public.custom_brokers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_brokers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brokers" ON public.custom_brokers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own brokers" ON public.custom_brokers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own brokers" ON public.custom_brokers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own brokers" ON public.custom_brokers FOR DELETE USING (auth.uid() = user_id);