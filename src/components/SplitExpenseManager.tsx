import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useExpenses } from '@/hooks/useExpenses';
import { toast } from 'sonner';
import { Users, Plus, Trash2, X, Check, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SplitExpenseManager() {
  const { splits, addSplitExpense, updateSplitPayment, deleteSplit } = useExpenses();
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidBy, setPaidBy] = useState('You');
  const [participants, setParticipants] = useState<string[]>(['You']);
  const [newParticipant, setNewParticipant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const addParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (name: string) => {
    if (name !== 'You') {
      setParticipants(participants.filter(p => p !== name));
      if (paidBy === name) setPaidBy('You');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (participants.length < 2) {
      toast.error('Add at least one more person to split with');
      return;
    }

    const amount = parseFloat(totalAmount);
    const splitAmount = amount / participants.length;

    addSplitExpense({
      totalAmount: amount,
      description: description.trim(),
      participants,
      paidBy,
      splitType: 'equal',
      splits: participants.map(p => ({
        name: p,
        amount: splitAmount,
        paid: p === paidBy,
      })),
      date,
    });

    toast.success('Split expense created');
    
    setDescription('');
    setTotalAmount('');
    setParticipants(['You']);
    setPaidBy('You');
  };

  // Calculate totals
  const totalOwedToYou = splits.reduce((sum, split) => {
    if (split.paidBy === 'You') {
      return sum + split.splits
        .filter(s => s.name !== 'You' && !s.paid)
        .reduce((s, p) => s + p.amount, 0);
    }
    return sum;
  }, 0);

  const totalYouOwe = splits.reduce((sum, split) => {
    if (split.paidBy !== 'You') {
      const yourSplit = split.splits.find(s => s.name === 'You');
      if (yourSplit && !yourSplit.paid) {
        return sum + yourSplit.amount;
      }
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bento-item bg-gradient-to-br from-success/10 to-background">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Owed to You
          </span>
          <div className="text-3xl font-bold text-success mt-2">
            ₹{totalOwedToYou.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bento-item bg-gradient-to-br from-destructive/10 to-background">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            You Owe
          </span>
          <div className="text-3xl font-bold text-destructive mt-2">
            ₹{totalYouOwe.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Split Form */}
        <form onSubmit={handleSubmit} className="bento-item">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Split
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Description
              </Label>
              <Input
                placeholder="e.g., Dinner at restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Total Amount (₹)
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
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

            {/* Participants */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Split With
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {participants.map((p) => (
                  <div
                    key={p}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
                      paidBy === p 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setPaidBy(p)}
                      className="text-xs opacity-70 hover:opacity-100"
                      title="Set as payer"
                    >
                      {paidBy === p ? '💰 Paid' : 'Set paid'}
                    </button>
                    <span>{p}</span>
                    {p !== 'You' && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(p)}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add person"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={addParticipant}>
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Split Preview */}
            {totalAmount && participants.length > 1 && (
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Split Preview
                </div>
                <div className="text-lg font-semibold">
                  ₹{(parseFloat(totalAmount) / participants.length).toFixed(2)} per person
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              <Plus className="w-4 h-4" />
              Create Split
            </Button>
          </div>
        </form>

        {/* Active Splits */}
        <div className="bento-item">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Splits
          </h3>

          {splits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No split expenses yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {splits.map((split) => {
                const allSettled = split.splits.every(s => s.paid);
                return (
                  <div 
                    key={split.id} 
                    className={cn(
                      "p-4 rounded-xl border transition-colors",
                      allSettled 
                        ? "bg-success/5 border-success/20" 
                        : "bg-secondary/50 border-border/50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{split.description}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(split.date).toLocaleDateString('en-IN')} • Paid by {split.paidBy}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          ₹{split.totalAmount.toLocaleString('en-IN')}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteSplit(split.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {split.splits.map((s) => (
                        <div 
                          key={s.name}
                          className="flex items-center justify-between text-sm py-2 border-t border-border/30"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={s.paid}
                              onCheckedChange={(checked) => 
                                updateSplitPayment(split.id, s.name, checked as boolean)
                              }
                              disabled={s.name === split.paidBy}
                            />
                            <span className={cn(s.paid && "line-through text-muted-foreground")}>
                              {s.name}
                            </span>
                          </div>
                          <span className={cn(
                            "font-medium",
                            s.paid ? "text-success" : "text-foreground"
                          )}>
                            ₹{s.amount.toFixed(2)}
                            {s.paid && <Check className="w-3 h-3 inline ml-1" />}
                          </span>
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
