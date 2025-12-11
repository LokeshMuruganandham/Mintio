import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenses } from '@/hooks/useExpenses';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Calendar,
  Target,
  Flame,
  ChevronLeft,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { DEMAT_COLORS, BROKER_PRESETS } from '@/types/expense';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, subMonths, addMonths, startOfYear, endOfYear, eachMonthOfInterval, isSameDay } from 'date-fns';

type ViewMode = 'day' | 'month' | 'year';

export function IntradayTracker() {
  const { 
    dematAccounts, 
    dailyTrades, 
    addDematAccount, 
    deleteDematAccount,
    addDailyTrade, 
    deleteDailyTrade,
    totalDematBalance,
    totalTradingPnl
  } = useExpenses();

  // Form states
  const [brokerName, setBrokerName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEMAT_COLORS[0]);

  // Trade entry states
  const [selectedAccount, setSelectedAccount] = useState('');
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split('T')[0]);
  const [tradePnl, setTradePnl] = useState('');
  const [tradeCharges, setTradeCharges] = useState('');
  const [tradeNotes, setTradeNotes] = useState('');

  // Calendar states
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarAccount, setSelectedCalendarAccount] = useState<string>('all');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerName.trim()) {
      toast.error('Please select a broker');
      return;
    }

    addDematAccount({
      brokerName: brokerName.trim(),
      accountId: accountId.trim() || undefined,
      balance: parseFloat(initialBalance) || 0,
      color: selectedColor,
    });

    toast.success('Demat account added');
    setBrokerName('');
    setAccountId('');
    setInitialBalance('');
  };

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) {
      toast.error('Please select an account');
      return;
    }
    if (!tradePnl) {
      toast.error('Please enter P&L amount');
      return;
    }

    addDailyTrade({
      dematAccountId: selectedAccount,
      date: tradeDate,
      pnl: parseFloat(tradePnl),
      charges: parseFloat(tradeCharges) || 0,
      notes: tradeNotes.trim() || undefined,
    });

    toast.success('Trade recorded');
    setTradePnl('');
    setTradeCharges('');
    setTradeNotes('');
  };

  // Filter trades by selected account
  const filteredTrades = useMemo(() => {
    if (selectedCalendarAccount === 'all') return dailyTrades;
    return dailyTrades.filter(t => t.dematAccountId === selectedCalendarAccount);
  }, [dailyTrades, selectedCalendarAccount]);

  // Calculate stats
  const stats = useMemo(() => {
    const profitDays = filteredTrades.filter(t => t.pnl > 0).length;
    const lossDays = filteredTrades.filter(t => t.pnl < 0).length;
    const totalDays = filteredTrades.length;
    const winRate = totalDays > 0 ? (profitDays / totalDays) * 100 : 0;
    const totalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalCharges = filteredTrades.reduce((sum, t) => sum + (t.charges || 0), 0);
    const netPnl = totalPnl - totalCharges;
    
    const bestDay = filteredTrades.reduce((best, t) => 
      t.pnl > (best?.pnl || -Infinity) ? t : best, filteredTrades[0]);
    
    // Calculate streak
    const sortedTrades = [...filteredTrades].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (const trade of sortedTrades) {
      if (trade.pnl > 0) {
        tempStreak++;
        if (currentStreak === 0 || currentStreak === tempStreak - 1) {
          currentStreak = tempStreak;
        }
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
        if (currentStreak > 0 && sortedTrades.indexOf(trade) === currentStreak) {
          currentStreak = 0;
        }
      }
    }

    return {
      profitDays,
      lossDays,
      totalDays,
      winRate,
      totalPnl,
      totalCharges,
      netPnl,
      bestDay,
      currentStreak,
      bestStreak,
    };
  }, [filteredTrades]);

  // Get trades for calendar
  const getTradesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredTrades.filter(t => t.date === dateStr);
  };

  const getDayPnl = (date: Date) => {
    const trades = getTradesForDate(date);
    return trades.reduce((sum, t) => sum + t.pnl - (t.charges || 0), 0);
  };

  const getMonthPnl = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    return filteredTrades
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      })
      .reduce((sum, t) => sum + t.pnl - (t.charges || 0), 0);
  };

  // Calendar rendering
  const renderMonthCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);
    const emptyDays = Array(startDay).fill(null);

    return (
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground py-2 font-medium">
            {d}
          </div>
        ))}
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const pnl = getDayPnl(day);
          const hasTrade = getTradesForDate(day).length > 0;
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`
                aspect-square rounded-md flex items-center justify-center text-xs font-medium
                transition-all cursor-default
                ${hasTrade 
                  ? pnl > 0 
                    ? 'bg-success/30 text-success-foreground' 
                    : pnl < 0 
                      ? 'bg-destructive/30 text-destructive-foreground'
                      : 'bg-muted text-muted-foreground'
                  : 'bg-secondary/30 text-muted-foreground'
                }
                ${isToday ? 'ring-2 ring-foreground' : ''}
              `}
              title={hasTrade ? `₹${pnl.toLocaleString('en-IN')}` : ''}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    );
  };

  const renderYearCalendar = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {months.map((month) => {
          const monthPnl = getMonthPnl(month);
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
          const startDay = getDay(monthStart);
          const emptyDays = Array(startDay).fill(null);

          return (
            <div key={month.toISOString()} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{format(month, "MMM'yy")}</span>
                <span className={`text-xs font-bold ${monthPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {monthPnl !== 0 && (monthPnl > 0 ? '+' : '')}
                  {monthPnl !== 0 ? `₹${Math.abs(monthPnl).toLocaleString('en-IN')}` : ''}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-[2px]">
                {emptyDays.map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {days.map((day) => {
                  const pnl = getDayPnl(day);
                  const hasTrade = getTradesForDate(day).length > 0;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        aspect-square rounded-sm
                        ${hasTrade 
                          ? pnl > 0 
                            ? 'bg-success/60' 
                            : pnl < 0 
                              ? 'bg-destructive/60'
                              : 'bg-muted'
                          : 'bg-secondary/20'
                        }
                      `}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (viewMode === 'year') {
      setCurrentDate(new Date(currentDate.getFullYear() + (direction === 'prev' ? -1 : 1), 0, 1));
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-item">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Net P&L</span>
          <div className={`text-3xl font-bold mt-1 ${stats.netPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
            {stats.netPnl >= 0 ? '+' : ''}₹{Math.abs(stats.netPnl).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Total P&L</span>
              <span className={stats.totalPnl >= 0 ? 'text-success' : 'text-destructive'}>
                ₹{stats.totalPnl.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Charges</span>
              <span>₹{stats.totalCharges.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bento-item">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Win Rate</span>
          <div className="text-3xl font-bold mt-1">{stats.winRate.toFixed(0)}%</div>
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-success">Profit days</span>
              <span>{stats.profitDays}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-destructive">Loss days</span>
              <span>{stats.lossDays}</span>
            </div>
          </div>
        </div>

        <div className="bento-item">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Days Traded</span>
          <div className="text-3xl font-bold mt-1">{stats.totalDays}</div>
          {stats.bestDay && (
            <div className="text-xs text-muted-foreground mt-2">
              <span>Best day: </span>
              <span className="text-success font-medium">
                +₹{stats.bestDay.pnl.toLocaleString('en-IN')}
              </span>
              <div className="text-muted-foreground/60">
                {format(new Date(stats.bestDay.date), 'dd MMM yyyy')}
              </div>
            </div>
          )}
        </div>

        <div className="bento-item">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Profit Streak</span>
          <div className="flex items-center gap-2 mt-1">
            <Flame className="w-6 h-6 text-warning" />
            <span className="text-3xl font-bold">{stats.bestStreak}</span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Current streak: {stats.currentStreak} days
          </div>
        </div>
      </div>

      {/* P&L Calendar */}
      <div className="bento-item">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            P&L Calendar
          </h3>
          
          <div className="flex items-center gap-4">
            <Select value={selectedCalendarAccount} onValueChange={setSelectedCalendarAccount}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {dematAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.brokerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              {(['month', 'year'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors
                    ${viewMode === mode ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'}
                  `}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold">
            {viewMode === 'month' 
              ? format(currentDate, 'MMMM yyyy')
              : format(currentDate, 'yyyy')
            }
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigateDate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {viewMode === 'month' && renderMonthCalendar()}
        {viewMode === 'year' && renderYearCalendar()}

        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-success/60" />
            <span className="text-muted-foreground">Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive/60" />
            <span className="text-muted-foreground">Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-secondary/30" />
            <span className="text-muted-foreground">No trade</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demat Accounts */}
        <div className="bento-item">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Demat Accounts
          </h3>

          {/* Account Summary */}
          <div className="p-4 rounded-xl bg-secondary/50 mb-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Balance</div>
            <div className="text-2xl font-bold">₹{totalDematBalance.toLocaleString('en-IN')}</div>
          </div>

          {/* Account List */}
          <div className="space-y-2 mb-6 max-h-[200px] overflow-y-auto">
            {dematAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No accounts added</p>
            ) : (
              dematAccounts.map((acc) => (
                <div 
                  key={acc.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: acc.color }}
                    />
                    <div>
                      <div className="font-medium text-sm">{acc.brokerName}</div>
                      {acc.accountId && (
                        <div className="text-xs text-muted-foreground">{acc.accountId}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">₹{acc.balance.toLocaleString('en-IN')}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => deleteDematAccount(acc.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Account Form */}
          <form onSubmit={handleAddAccount} className="space-y-3 pt-4 border-t border-border/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Broker</Label>
                <Select value={brokerName} onValueChange={setBrokerName}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select broker" />
                  </SelectTrigger>
                  <SelectContent>
                    {BROKER_PRESETS.map((broker) => (
                      <SelectItem key={broker} value={broker}>{broker}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Account ID (Optional)</Label>
                <Input 
                  placeholder="XX1234"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Initial Balance (₹)</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Color</Label>
                <div className="flex gap-1">
                  {DEMAT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full h-9">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </form>
        </div>

        {/* Record Trade */}
        <div className="bento-item">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Record Today's P&L
          </h3>

          <form onSubmit={handleAddTrade} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Demat Account
                </Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {dematAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.brokerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Date
                </Label>
                <Input
                  type="date"
                  value={tradeDate}
                  onChange={(e) => setTradeDate(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  P&L (₹) <span className="text-muted-foreground/60">+profit / -loss</span>
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 500 or -200"
                  value={tradePnl}
                  onChange={(e) => setTradePnl(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Charges (₹) <span className="text-muted-foreground/60">optional</span>
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={tradeCharges}
                  onChange={(e) => setTradeCharges(e.target.value)}
                  className="h-12"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Notes (Optional)
              </Label>
              <Textarea
                placeholder="Trade details, strategy used..."
                value={tradeNotes}
                onChange={(e) => setTradeNotes(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={dematAccounts.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Record Trade
            </Button>
          </form>

          {/* Recent Trades */}
          {dailyTrades.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Recent Trades</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {dailyTrades.slice(0, 10).map((trade) => {
                  const account = dematAccounts.find(a => a.id === trade.dematAccountId);
                  const netPnl = trade.pnl - (trade.charges || 0);
                  return (
                    <div 
                      key={trade.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        {netPnl >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-success" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                        <div>
                          <div className="text-sm font-medium">
                            {account?.brokerName || 'Unknown'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(trade.date), 'dd MMM yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${netPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {netPnl >= 0 ? '+' : ''}₹{netPnl.toLocaleString('en-IN')}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteDailyTrade(trade.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}