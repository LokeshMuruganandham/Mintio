import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { 
  User, 
  Phone, 
  Mail, 
  LogOut, 
  Save, 
  Building, 
  Wallet, 
  Plus, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { PAYMENT_METHODS, PaymentMethod, BANK_COLORS, DEMAT_COLORS, BROKER_PRESETS } from '@/types/expense';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Profile {
  display_name: string | null;
  phone_number: string | null;
}

export function ProfileManager() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { 
    bankAccounts, 
    addBankAccount, 
    deleteBankAccount, 
    totalBankBalance,
    dematAccounts,
    addDematAccount,
    deleteDematAccount,
    totalDematBalance,
    customBrokers,
    addCustomBroker,
    deleteCustomBroker,
  } = useExpenses();

  // Profile states
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Bank account form
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankBalance, setBankBalance] = useState('');
  const [linkedMethods, setLinkedMethods] = useState<PaymentMethod[]>([]);

  // Demat account form
  const [showDematForm, setShowDematForm] = useState(false);
  const [brokerName, setBrokerName] = useState('');
  const [customBrokerInput, setCustomBrokerInput] = useState('');
  const [dematAccountId, setDematAccountId] = useState('');
  const [dematBalance, setDematBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEMAT_COLORS[0]);

  // Section states
  const [bankSectionOpen, setBankSectionOpen] = useState(false);
  const [dematSectionOpen, setDematSectionOpen] = useState(false);

  const allBrokers = [...BROKER_PRESETS, ...customBrokers];

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, phone_number')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setDisplayName(data.display_name || '');
        setPhoneNumber(data.phone_number || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          phone_number: phoneNumber.trim() || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Profile updated');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !bankName.trim()) {
      toast.error('Please enter account and bank name');
      return;
    }

    addBankAccount({
      name: accountName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim() || undefined,
      balance: parseFloat(bankBalance.replace(/,/g, '')) || 0,
      color: BANK_COLORS[bankAccounts.length % BANK_COLORS.length],
      linkedPaymentMethods: linkedMethods,
    });

    toast.success('Bank account added');
    setAccountName('');
    setBankName('');
    setAccountNumber('');
    setBankBalance('');
    setLinkedMethods([]);
    setShowBankForm(false);
  };

  const handleAddDematAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerName.trim()) {
      toast.error('Please select a broker');
      return;
    }

    addDematAccount({
      brokerName: brokerName.trim(),
      accountId: dematAccountId.trim() || undefined,
      balance: parseFloat(dematBalance.replace(/,/g, '')) || 0,
      color: selectedColor,
    });

    toast.success('Demat account added');
    setBrokerName('');
    setDematAccountId('');
    setDematBalance('');
    setShowDematForm(false);
  };

  const handleAddCustomBroker = () => {
    if (!customBrokerInput.trim()) {
      toast.error('Please enter a broker name');
      return;
    }
    if (allBrokers.includes(customBrokerInput.trim())) {
      toast.error('Broker already exists');
      return;
    }
    addCustomBroker(customBrokerInput.trim());
    setBrokerName(customBrokerInput.trim());
    setCustomBrokerInput('');
    toast.success('Broker added');
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    setLinkedMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Theme Toggle */}
      <div className="bento-item">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Sun className="w-4 h-4" />
          Appearance
        </h3>
        <div className="flex gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
            className="flex-1"
          >
            <Sun className="w-4 h-4 mr-2" />
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="flex-1"
          >
            <Moon className="w-4 h-4 mr-2" />
            Dark
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('system')}
            className="flex-1"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Auto
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bento-item">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Profile
        </h3>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              Email
            </Label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-secondary/50 h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="w-3 h-3" />
              Display Name
            </Label>
            <Input
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              Phone Number
            </Label>
            <Input
              placeholder="+91 1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="w-full h-9">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      {/* Bank Accounts Section */}
      <Collapsible open={bankSectionOpen} onOpenChange={setBankSectionOpen}>
        <div className="bento-item !p-4">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Building className="w-4 h-4" />
                Bank Accounts
                <span className="text-sm font-normal text-muted-foreground">
                  ({bankAccounts.length})
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  ₹{totalBankBalance.toLocaleString('en-IN')}
                </span>
                {bankSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-3">
            <div className="space-y-2">
              {bankAccounts.map((account) => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30"
                  style={{ borderLeftColor: account.color, borderLeftWidth: '3px' }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{account.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {account.bankName}
                      {account.accountNumber && ` • ****${account.accountNumber.slice(-4)}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-semibold text-sm">₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => deleteBankAccount(account.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {!showBankForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowBankForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bank Account
                </Button>
              ) : (
                <form onSubmit={handleAddBankAccount} className="p-3 rounded-lg bg-secondary/30 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Account Name</Label>
                      <Input
                        placeholder="Salary Account"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Bank Name</Label>
                      <Input
                        placeholder="HDFC Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Account No. (Optional)</Label>
                      <Input
                        placeholder="XXXX1234"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Balance (₹)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        inputMode="decimal"
                        value={bankBalance}
                        onChange={(e) => setBankBalance(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Linked Payment Methods</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {PAYMENT_METHODS.map((method) => (
                        <label
                          key={method.value}
                          className="flex items-center gap-1.5 px-2 py-1 rounded bg-background cursor-pointer text-xs"
                        >
                          <Checkbox
                            checked={linkedMethods.includes(method.value)}
                            onCheckedChange={() => togglePaymentMethod(method.value)}
                            className="h-3 w-3"
                          />
                          <span>{method.icon} {method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1 h-8">Add</Button>
                    <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setShowBankForm(false)}>Cancel</Button>
                  </div>
                </form>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Demat Accounts Section */}
      <Collapsible open={dematSectionOpen} onOpenChange={setDematSectionOpen}>
        <div className="bento-item !p-4">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Demat Accounts
                <span className="text-sm font-normal text-muted-foreground">
                  ({dematAccounts.length})
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  ₹{totalDematBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {dematSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-3">
            <div className="space-y-2">
              {dematAccounts.map((acc) => (
                <div 
                  key={acc.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30"
                  style={{ borderLeftColor: acc.color, borderLeftWidth: '3px' }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{acc.brokerName}</div>
                    {acc.accountId && (
                      <div className="text-xs text-muted-foreground">{acc.accountId}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-semibold text-sm">₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => deleteDematAccount(acc.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {!showDematForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowDematForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Demat Account
                </Button>
              ) : (
                <form onSubmit={handleAddDematAccount} className="p-3 rounded-lg bg-secondary/30 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Broker</Label>
                    <Select value={brokerName} onValueChange={setBrokerName}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select broker" />
                      </SelectTrigger>
                      <SelectContent>
                        {allBrokers.map((broker) => (
                          <SelectItem key={broker} value={broker}>{broker}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Can't find your broker?</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Broker name"
                        value={customBrokerInput}
                        onChange={(e) => setCustomBrokerInput(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button type="button" variant="secondary" size="sm" className="h-8" onClick={handleAddCustomBroker}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {customBrokers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {customBrokers.map((broker) => (
                        <span key={broker} className="inline-flex items-center gap-1 px-2 py-0.5 bg-background rounded text-xs">
                          {broker}
                          <button type="button" onClick={() => deleteCustomBroker(broker)} className="hover:text-destructive">×</button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Account ID (Optional)</Label>
                      <Input 
                        placeholder="XX1234"
                        value={dematAccountId}
                        onChange={(e) => setDematAccountId(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Balance (₹)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        inputMode="decimal"
                        value={dematBalance}
                        onChange={(e) => setDematBalance(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Color</Label>
                    <div className="flex gap-1.5">
                      {DEMAT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-5 h-5 rounded-full border-2 transition-all ${
                            selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1 h-8">Add</Button>
                    <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setShowDematForm(false)}>Cancel</Button>
                  </div>
                </form>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Sign Out */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
