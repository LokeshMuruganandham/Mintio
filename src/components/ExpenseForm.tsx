import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  PAYMENT_METHODS, 
  EXPENSE_CATEGORIES, 
  ACCOUNT_TYPES, 
  UPI_APPS,
  PaymentMethod,
  ExpenseCategory,
  AccountType 
} from '@/types/expense';
import { useExpenses } from '@/hooks/useExpenses';
import { toast } from 'sonner';
import { Plus, Smartphone, Building } from 'lucide-react';

export function ExpenseForm() {
  const { addExpense, bankAccounts } = useExpenses();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [account, setAccount] = useState<AccountType>('personal');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [upiApp, setUpiApp] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Get bank accounts that are linked to the selected payment method
  const linkedBankAccounts = bankAccounts.filter(
    acc => acc.linkedPaymentMethods.includes(paymentMethod) || acc.linkedPaymentMethods.length === 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const selectedBank = bankAccounts.find(a => a.id === bankAccountId);
    if (bankAccountId && selectedBank && selectedBank.balance < parseFloat(amount)) {
      toast.warning(`This will overdraw your ${selectedBank.name} account`);
    }

    addExpense({
      amount: parseFloat(amount),
      description,
      category,
      paymentMethod,
      account,
      bankAccountId: bankAccountId || undefined,
      date,
      upiApp: paymentMethod === 'upi' ? upiApp : undefined,
    });

    toast.success('Expense added successfully');
    
    // Reset form
    setAmount('');
    setDescription('');
    setCategory('other');
    setUpiApp('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bento-item">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Expense
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs uppercase tracking-wider text-muted-foreground">
              Amount (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-semibold h-14"
              step="0.01"
              min="0"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs uppercase tracking-wider text-muted-foreground">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-14"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Category
            </Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Payment Method
            </Label>
            <Select value={paymentMethod} onValueChange={(v) => {
              setPaymentMethod(v as PaymentMethod);
              setBankAccountId(''); // Reset bank account when payment method changes
            }}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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

          {/* UPI App (conditional) */}
          {paymentMethod === 'upi' && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Smartphone className="w-3 h-3" />
                UPI App
              </Label>
              <Select value={upiApp} onValueChange={setUpiApp}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select UPI app" />
                </SelectTrigger>
                <SelectContent>
                  {UPI_APPS.map((app) => (
                    <SelectItem key={app} value={app}>
                      {app}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bank Account */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building className="w-3 h-3" />
              Deduct from Bank Account
            </Label>
            <Select value={bankAccountId} onValueChange={setBankAccountId}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No account (don't track balance)</SelectItem>
                {bankAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    <span className="flex items-center gap-2">
                      <span>{acc.name}</span>
                      <span className="text-muted-foreground text-xs">
                        (₹{acc.balance.toLocaleString('en-IN')})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Account Type
            </Label>
            <Select value={account} onValueChange={(v) => setAccount(v as AccountType)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((acc) => (
                  <SelectItem key={acc.value} value={acc.value}>
                    {acc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mt-6">
          <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="What was this expense for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full mt-6" size="lg">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>
    </form>
  );
}
