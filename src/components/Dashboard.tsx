import { useExpenses } from '@/hooks/useExpenses';
import { StatCard } from '@/components/StatCard';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/types/expense';
import { Wallet, TrendingDown, TrendingUp, CreditCard, ArrowDownRight, Building, Rocket } from 'lucide-react';

export function Dashboard() {
  const { 
    expenses,
    totalExpenses, 
    totalInvestments, 
    totalDematBalance,
    totalTradingPnl,
    totalBankBalance,
    expensesByCategory,
    expensesByPaymentMethod,
    thisMonthTotal,
    thisMonthExpenses,
    bankAccounts,
    dematAccounts,
  } = useExpenses();

  // Calculate recent transactions for quick view
  const recentExpenses = expenses.slice(0, 5);

  // Get top categories
  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  // Calculate daily average
  const daysInMonth = new Date().getDate();
  const dailyAverage = thisMonthTotal / daysInMonth;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">MoneyFlow</h1>
        <p className="text-muted-foreground mt-1">Track every rupee, grow your wealth</p>
      </div>

      {/* Main Stats - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bank Balance"
          value={totalBankBalance}
          subtitle={`${bankAccounts.length} accounts`}
          icon={<Building className="w-5 h-5" />}
          size="large"
          className="md:col-span-2 lg:col-span-2"
        />
        
        <StatCard
          title="This Month"
          value={thisMonthTotal}
          subtitle={`${thisMonthExpenses.length} transactions`}
          icon={<Wallet className="w-5 h-5" />}
        />
        
        <StatCard
          title="Total Expenses"
          value={totalExpenses}
          subtitle="All time"
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </div>

      {/* Investments Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Venture Capital"
          value={totalInvestments}
          subtitle="Startups"
          icon={<Rocket className="w-5 h-5" />}
        />
        
        <StatCard
          title="Trading P&L"
          value={totalTradingPnl}
          subtitle={`${dematAccounts.length} demat accounts`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={totalTradingPnl >= 0 ? 'up' : 'down'}
        />
        
        <StatCard
          title="Daily Average"
          value={Math.round(dailyAverage)}
          subtitle="This month spend"
          icon={<CreditCard className="w-5 h-5" />}
        />
      </div>

      {/* Bank Accounts Quick View */}
      {bankAccounts.length > 0 && (
        <div className="bento-item">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
            Bank Accounts
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {bankAccounts.map((account) => (
              <div 
                key={account.id}
                className="p-4 rounded-xl bg-secondary/50 border border-border/50"
                style={{ borderLeftColor: account.color, borderLeftWidth: '3px' }}
              >
                <div className="text-xs text-muted-foreground">{account.bankName}</div>
                <div className="font-semibold truncate">{account.name}</div>
                <div className="text-lg font-bold mt-1">
                  ₹{account.balance.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="bento-item">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
          Payment Methods
        </h3>
        <div className="flex flex-wrap gap-3">
          {PAYMENT_METHODS.map((method) => {
            const amount = expensesByPaymentMethod[method.value] || 0;
            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
            
            return (
              <div 
                key={method.value}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50"
              >
                <span className="text-lg">{method.icon}</span>
                <div>
                  <div className="text-sm font-medium">{method.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(0)}% • ₹{amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Categories */}
        <div className="bento-item">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
            Top Categories
          </h3>
          
          {topCategories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map(([category, amount]) => {
                const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === category);
                const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryInfo?.icon}</span>
                        <span className="font-medium">{categoryInfo?.label}</span>
                      </div>
                      <span className="font-semibold">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-foreground rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bento-item">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
            Recent Activity
          </h3>
          
          {recentExpenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
                
                return (
                  <div 
                    key={expense.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <span>{categoryInfo?.icon || '📦'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">
                        {expense.description || categoryInfo?.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-foreground">
                      <ArrowDownRight className="w-3 h-3 text-destructive" />
                      <span className="font-semibold text-sm">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
