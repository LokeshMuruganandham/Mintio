import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExpenses } from '@/hooks/useExpenses';
import { toast } from 'sonner';
import { Plus, Trash2, Building, Wallet } from 'lucide-react';
import { PAYMENT_METHODS, PaymentMethod, BANK_COLORS } from '@/types/expense';
import { Checkbox } from '@/components/ui/checkbox';

export function BankAccountManager() {
  const { bankAccounts, addBankAccount, deleteBankAccount, totalBankBalance } = useExpenses();
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [linkedMethods, setLinkedMethods] = useState<PaymentMethod[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter account name');
      return;
    }
    
    if (!bankName.trim()) {
      toast.error('Please enter bank name');
      return;
    }

    addBankAccount({
      name: name.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim() || undefined,
      balance: parseFloat(balance.replace(/,/g, '')) || 0,
      color: BANK_COLORS[bankAccounts.length % BANK_COLORS.length],
      linkedPaymentMethods: linkedMethods,
    });

    toast.success('Bank account added');
    setName('');
    setBankName('');
    setAccountNumber('');
    setBalance('');
    setLinkedMethods([]);
    setShowForm(false);
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    setLinkedMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  return (
    <div className="space-y-6">
      {/* Total Balance Summary */}
      <div className="bento-item bg-gradient-to-br from-secondary to-background">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Total Bank Balance
            </span>
            <div className="text-4xl font-bold mt-2">
              ₹{totalBankBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Across {bankAccounts.length} accounts
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-primary/10">
            <Building className="w-8 h-8 text-foreground" />
          </div>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bankAccounts.map((account) => (
          <div 
            key={account.id} 
            className="bento-item relative group"
            style={{ borderLeftColor: account.color, borderLeftWidth: '4px' }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => deleteBankAccount(account.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{account.bankName}</span>
              </div>
              <h4 className="font-semibold text-lg">{account.name}</h4>
              {account.accountNumber && (
                <p className="text-xs text-muted-foreground">
                  ****{account.accountNumber.slice(-4)}
                </p>
              )}
              <div className="text-2xl font-bold">
                ₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {account.linkedPaymentMethods.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-border/50">
                  {account.linkedPaymentMethods.map(method => {
                    const info = PAYMENT_METHODS.find(m => m.value === method);
                    return (
                      <span key={method} className="text-xs px-2 py-1 rounded-full bg-secondary">
                        {info?.icon} {info?.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Account Card */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="bento-item border-dashed flex flex-col items-center justify-center min-h-[200px] hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <Plus className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Add Bank Account</span>
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="bento-item space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Account Name
              </Label>
              <Input
                placeholder="e.g., Salary Account"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Bank Name
              </Label>
              <Input
                placeholder="e.g., HDFC Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Account Number (Optional)
              </Label>
              <Input
                placeholder="Last 4 digits shown"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Current Balance (₹)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                inputMode="decimal"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Linked Payment Methods
              </Label>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <Checkbox
                      checked={linkedMethods.includes(method.value)}
                      onCheckedChange={() => togglePaymentMethod(method.value)}
                    />
                    <span className="text-sm">{method.icon} {method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" size="sm" className="flex-1">
                <Plus className="w-4 h-4" />
                Add
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
