import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpenses } from '@/hooks/useExpenses';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, ExpenseCategory, PaymentMethod } from '@/types/expense';
import { Receipt, Trash2, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExpenseHistory() {
  const { expenses, deleteExpense } = useExpenses();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'all'>('all');

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesPayment = paymentFilter === 'all' || expense.paymentMethod === paymentFilter;
    return matchesSearch && matchesCategory && matchesPayment;
  });

  const getCategoryInfo = (category: ExpenseCategory) => {
    return EXPENSE_CATEGORIES.find(c => c.value === category) || { icon: '📦', label: 'Other' };
  };

  const getPaymentInfo = (method: PaymentMethod) => {
    return PAYMENT_METHODS.find(m => m.value === method) || { icon: '💳', label: 'Card' };
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bento-item">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as ExpenseCategory | 'all')}>
              <SelectTrigger className="w-[160px] h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentMethod | 'all')}>
              <SelectTrigger className="w-[160px] h-12">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <span className="flex items-center gap-2">
                      <span>{method.icon}</span>
                      <span>{method.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="bento-item">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          All Transactions
          <span className="text-sm font-normal text-muted-foreground">
            ({filteredExpenses.length})
          </span>
        </h3>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No expenses found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {filteredExpenses.map((expense, index) => {
              const categoryInfo = getCategoryInfo(expense.category);
              const paymentInfo = getPaymentInfo(expense.paymentMethod);
              
              return (
                <div 
                  key={expense.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl">
                    {categoryInfo.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">
                        {expense.description || categoryInfo.label}
                      </h4>
                      {expense.upiApp && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                          {expense.upiApp}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        {paymentInfo.icon} {paymentInfo.label}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded bg-accent">
                        {expense.account}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => deleteExpense(expense.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
