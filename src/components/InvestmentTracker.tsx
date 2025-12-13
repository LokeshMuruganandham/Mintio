import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useExpenses } from '@/hooks/useExpenses';
import { toast } from 'sonner';
import { Rocket, Plus, Trash2, Building2, X } from 'lucide-react';
import { STARTUP_PRESET_COLORS } from '@/types/expense';

export function InvestmentTracker() {
  const { investments, addInvestment, deleteInvestment, totalInvestments, startupPresets, addStartupPreset, deleteStartupPreset } = useExpenses();
  const [startupName, setStartupName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [newPresetName, setNewPresetName] = useState('');
  const [showAddPreset, setShowAddPreset] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startupName.trim()) {
      toast.error('Please enter startup name');
      return;
    }
    
    const sanitizedAmount = amount ? parseFloat(amount.replace(/,/g, '')) : 0;
    if (!amount || sanitizedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addInvestment({
      startupName: startupName.trim(),
      amount: sanitizedAmount,
      date,
      notes: notes.trim() || undefined,
    });

    toast.success('Investment recorded');
    
    setStartupName('');
    setAmount('');
    setNotes('');
  };

  const handleAddPreset = () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a startup name');
      return;
    }
    
    addStartupPreset({
      name: newPresetName.trim(),
      color: STARTUP_PRESET_COLORS[startupPresets.length % STARTUP_PRESET_COLORS.length],
    });
    
    toast.success('Startup added to presets');
    setNewPresetName('');
    setShowAddPreset(false);
  };

  const selectPreset = (name: string) => {
    setStartupName(name);
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
              Total Venture Capital
            </span>
            <div className="text-4xl font-bold mt-2">
              ₹{totalInvestments.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Across {Object.keys(investmentsByStartup).length} ventures
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-primary/10">
            <Rocket className="w-8 h-8 text-foreground" />
          </div>
        </div>
      </div>

      {/* Startup Presets */}
      <div className="bento-item">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
          Your Ventures (Click to select)
        </h3>
        <div className="flex flex-wrap gap-2">
          {startupPresets.map((preset) => (
            <div key={preset.id} className="group relative">
              <button
                type="button"
                onClick={() => selectPreset(preset.name)}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  startupName === preset.name 
                    ? 'bg-foreground text-background border-foreground' 
                    : 'bg-secondary/50 border-border/50 hover:bg-secondary'
                }`}
                style={{ borderLeftColor: preset.color, borderLeftWidth: '3px' }}
              >
                {preset.name}
              </button>
              <button
                onClick={() => deleteStartupPreset(preset.id)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {!showAddPreset ? (
            <button
              onClick={() => setShowAddPreset(true)}
              className="px-4 py-2 rounded-xl border border-dashed border-border/50 text-muted-foreground hover:bg-secondary/30 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Venture
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Venture name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="h-10 w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPreset();
                  }
                }}
              />
              <Button size="sm" onClick={handleAddPreset}>
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddPreset(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
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
                Venture Name
              </Label>
              <Input
                placeholder="Select from above or type new"
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
                  inputMode="decimal"
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
            Your Ventures
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
