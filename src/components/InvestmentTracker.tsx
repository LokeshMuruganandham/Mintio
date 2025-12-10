import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useExpenses } from '@/hooks/useExpenses';
import { toast } from 'sonner';
import { Rocket, Plus, Trash2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InvestmentTracker() {
  const { investments, addInvestment, deleteInvestment, totalInvestments } = useExpenses();
  const [startupName, setStartupName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startupName.trim()) {
      toast.error('Please enter startup name');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addInvestment({
      startupName: startupName.trim(),
      amount: parseFloat(amount),
      date,
      notes: notes.trim() || undefined,
    });

    toast.success('Investment recorded');
    
    setStartupName('');
    setAmount('');
    setNotes('');
  };

  // Group investments by startup
  const investmentsByStartup = investments.reduce((acc, inv) => {
    if (!acc[inv.startupName]) {
      acc[inv.startupName] = [];
    }
    acc[inv.startupName].push(inv);
    return acc;
  }, {} as Record<string, typeof investments>);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bento-item bg-gradient-to-br from-secondary to-background">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Total Invested in Startups
            </span>
            <div className="text-4xl font-bold mt-2">
              ₹{totalInvestments.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Across {Object.keys(investmentsByStartup).length} startups
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-primary/10">
            <Rocket className="w-8 h-8 text-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Investment Form */}
        <form onSubmit={handleSubmit} className="bento-item">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Record Investment
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Startup Name
              </Label>
              <Input
                placeholder="e.g., TechVenture Inc."
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Amount (₹)
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Notes (Optional)
              </Label>
              <Textarea
                placeholder="Investment details, equity %, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Plus className="w-4 h-4" />
              Add Investment
            </Button>
          </div>
        </form>

        {/* Investments by Startup */}
        <div className="bento-item">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Your Startups
          </h3>

          {Object.keys(investmentsByStartup).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Rocket className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No investments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(investmentsByStartup).map(([name, invs]) => {
                const total = invs.reduce((sum, i) => sum + i.amount, 0);
                return (
                  <div 
                    key={name} 
                    className="p-4 rounded-xl bg-secondary/50 border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {invs.length} investment{invs.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="text-lg font-bold">
                        ₹{total.toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {invs.map((inv) => (
                        <div 
                          key={inv.id}
                          className="flex items-center justify-between text-sm py-2 border-t border-border/30"
                        >
                          <div>
                            <span className="text-muted-foreground">
                              {new Date(inv.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {inv.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[150px]">
                                {inv.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              ₹{inv.amount.toLocaleString('en-IN')}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteInvestment(inv.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
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
