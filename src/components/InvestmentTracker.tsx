import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useExpenses } from '@/hooks/useExpenses';
import { toast } from 'sonner';
import { Rocket, Plus, Trash2, Building2, X, Edit2, Check } from 'lucide-react';
// Chart removed: replaced with analytics box
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { STARTUP_PRESET_COLORS } from '@/types/expense';

export function InvestmentTracker() {
  const { investments, addInvestment, deleteInvestment, updateInvestment, totalInvestments, startupPresets, addStartupPreset, deleteStartupPreset } = useExpenses();
  const [startupName, setStartupName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [newPresetName, setNewPresetName] = useState('');
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<null | { id: string; startupName: string; amount: number; date: string; notes?: string }>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<null | { id: string; startupName: string; amount: number; date: string; notes?: string }>(null);
  // Analytics box: per-venture metrics

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

  const openVentureDetails = (ventureName: string) => {
    const invs = investmentsByStartup[ventureName] || [];
    if (invs.length === 0) return;
    const sorted = [...invs].sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());
    const candidate = sorted[0];
    if (!candidate) return;
    if (isEditOpen && isEditable && selectedInvestment?.id !== candidate.id) {
      setPendingSelection(candidate);
      setShowDiscardDialog(true);
      return;
    }
    setSelectedInvestment({ id: candidate.id, startupName: candidate.startupName, amount: candidate.amount, date: candidate.date, notes: candidate.notes });
    setIsEditOpen(true);
    setIsEditable(false);
  };

  // Group investments by startup
  const investmentsByStartup = investments.reduce((acc, inv) => {
    if (!acc[inv.startupName]) {
      acc[inv.startupName] = [];
    }
    acc[inv.startupName].push(inv);
    return acc;
  }, {} as Record<string, typeof investments>);

  // Analytics metrics per venture
  const analytics = useMemo(() => {
    return Object.entries(investmentsByStartup).map(([name, invs]) => {
      const total = invs.reduce((s, i) => s + i.amount, 0);
      const count = invs.length;
      const avg = count > 0 ? total / count : 0;
      const dates = invs.map(i => new Date(i.date)).sort((a, b) => a.getTime() - b.getTime());
      const first = dates[0];
      const last = dates[dates.length - 1];
      return {
        name,
        total,
        count,
        avg,
        first: first ? first.toISOString().split('T')[0] : undefined,
        last: last ? last.toISOString().split('T')[0] : undefined,
      };
    }).sort((a, b) => b.total - a.total);
  }, [investmentsByStartup]);

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
      {/* Investments Analytics Box */}
      <div className="bento-item">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Investment Analytics</h3>
        </div>
        <div className="space-y-3">
          {analytics.length === 0 ? (
            <div className="text-sm text-muted-foreground">No investments to analyze yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
              {analytics.map(a => (
                <div
                  key={a.name}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') openVentureDetails(a.name); }}
                  onClick={() => openVentureDetails(a.name)}
                  className="p-4 rounded-xl bg-secondary/50 border border-border/50 flex flex-col items-start justify-between h-20 sm:h-24 md:h-28 w-full hover:shadow-md hover:border-foreground/50 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="text-left">
                    <div className="text-2xl sm:text-2xl font-extrabold">₹{a.total.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-muted-foreground mt-1">{a.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                          className="flex items-center justify-between text-sm py-2 border-t border-border/30 cursor-pointer focus:outline-none focus-visible:outline-none bg-transparent select-none active:bg-transparent"
                          onClick={() => {
                            if (isEditOpen && isEditable && selectedInvestment?.id !== inv.id) {
                              setPendingSelection({ id: inv.id, startupName: inv.startupName, amount: inv.amount, date: inv.date, notes: inv.notes });
                              setShowDiscardDialog(true);
                              return;
                            }
                            setSelectedInvestment({ id: inv.id, startupName: inv.startupName, amount: inv.amount, date: inv.date, notes: inv.notes });
                            setIsEditOpen(true);
                            setIsEditable(false);
                          }}
                          tabIndex={0}
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

      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setSelectedInvestment(null); setIsEditable(false); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
          </DialogHeader>

          {selectedInvestment && (
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Venture</Label>
                <Input value={selectedInvestment.startupName} readOnly={!isEditable} onChange={(e) => setSelectedInvestment({ ...selectedInvestment, startupName: e.target.value }) as any} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amount (₹)</Label>
                  <Input type="number" step="0.01" inputMode="decimal" value={selectedInvestment.amount.toString()} readOnly={!isEditable} onChange={(e) => setSelectedInvestment({ ...selectedInvestment, amount: parseFloat((e.target.value || '0').replace(/,/g, '')) }) as any} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
                  <Input type="date" value={selectedInvestment.date} readOnly={!isEditable} onChange={(e) => setSelectedInvestment({ ...selectedInvestment, date: e.target.value }) as any} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Notes</Label>
                <Textarea value={selectedInvestment.notes || ''} readOnly={!isEditable} onChange={(e) => setSelectedInvestment({ ...selectedInvestment, notes: e.target.value }) as any} rows={3} />
              </div>

              <div className="flex gap-2 pt-2 items-center">
                <Button size="sm" variant={isEditable ? 'ghost' : 'outline'} onClick={() => {
                  if (isEditable && selectedInvestment) {
                    const original = investments.find(i => i.id === selectedInvestment.id);
                    if (original) setSelectedInvestment({ ...original });
                  }
                  setIsEditable(prev => !prev);
                }}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  {isEditable ? 'Cancel' : 'Edit'}
                </Button>

                <Button size="sm" className="flex-1" disabled={!isEditable} onClick={async () => {
                  if (!selectedInvestment) return;
                  const updated = await updateInvestment(selectedInvestment.id, {
                    startupName: selectedInvestment.startupName,
                    amount: selectedInvestment.amount,
                    date: selectedInvestment.date,
                    notes: selectedInvestment.notes,
                  });
                  if (updated) {
                    toast.success('Investment updated');
                    setIsEditOpen(false);
                    setSelectedInvestment(null);
                    setIsEditable(false);
                  }
                }}>
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="destructive" onClick={async () => {
                  if (!selectedInvestment) return;
                  setShowConfirmDelete(true);
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                {/* Close button removed — cross in top right closes dialog */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this investment? This action cannot be undone.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                if (selectedInvestment) {
                  await deleteInvestment(selectedInvestment.id);
                  setIsEditOpen(false);
                  setSelectedInvestment(null);
                  toast.success('Investment deleted');
                }
                setShowConfirmDelete(false);
              }}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Discard Changes Dialog */}
        <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Discard Changes</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>You have unsaved changes. Do you want to discard them and open a different investment?</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                if (pendingSelection) {
                  setSelectedInvestment(pendingSelection);
                  setIsEditOpen(true);
                  setIsEditable(false);
                  setPendingSelection(null);
                }
                setShowDiscardDialog(false);
              }}>
                Discard & Open
              </Button>
            </div>
          </DialogContent>
        </Dialog>

    </div>
  );
}
