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
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { DematTransactionType } from '@/types/expense';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, startOfYear, endOfYear, eachMonthOfInterval, isSameDay } from 'date-fns';

type ViewMode = 'day' | 'month' | 'year';

export function IntradayTracker() {
  const { 
    dematAccounts, 
    dailyTrades, 
    dematTransactions,
    customBrokers,
    addDailyTrade, 
    deleteDailyTrade,
    addDematTransaction,
    deleteDematTransaction,
    totalDematBalance,
  } = useExpenses();

  // Transaction states
  const [transactionAccount, setTransactionAccount] = useState('');
  const [transactionType, setTransactionType] = useState<DematTransactionType>('deposit');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

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

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionAccount) {
      toast.error('Please select an account');
      return;
    }
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addDematTransaction({
      dematAccountId: transactionAccount,
      type: transactionType,
      amount: parseFloat(transactionAmount),
      date: transactionDate,
    });

    toast.success(`${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} recorded`);
    setTransactionAmount('');
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
        </div>

        {/* Fund Management */}
        <div className="bento-item">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Fund Management
            </h3>
            <div className="text-sm text-muted-foreground">
              Total: ₹{totalDematBalance.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Quick account balances */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {dematAccounts.map((acc) => (
              <div 
                key={acc.id}
                className="p-3 rounded-lg bg-secondary/30 flex items-center justify-between"
                style={{ borderLeftColor: acc.color, borderLeftWidth: '3px' }}
              >
                <span className="text-sm font-medium">{acc.brokerName}</span>
                <span className="text-sm">₹{acc.balance.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Deposit/Withdraw Form */}
          <form onSubmit={handleAddTransaction} className="space-y-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Account</Label>
                <Select value={transactionAccount} onValueChange={setTransactionAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
                <Select value={transactionType} onValueChange={(v) => setTransactionType(v as DematTransactionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">
                      <span className="flex items-center gap-2">
                        <ArrowDownCircle className="w-4 h-4 text-success" />
                        Deposit
                      </span>
                    </SelectItem>
                    <SelectItem value="withdrawal">
                      <span className="flex items-center gap-2">
                        <ArrowUpCircle className="w-4 h-4 text-destructive" />
                        Withdraw
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" variant="outline" className="w-full" disabled={dematAccounts.length === 0}>
              {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'} Funds
            </Button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bento-item">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        
        {(dailyTrades.length > 0 || dematTransactions.length > 0) ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {[...dailyTrades.map(trade => {
              const account = dematAccounts.find(a => a.id === trade.dematAccountId);
              const netPnl = trade.pnl - (trade.charges || 0);
              return {
                id: trade.id,
                type: 'trade' as const,
                date: trade.date,
                amount: netPnl,
                accountName: account?.brokerName || 'Unknown',
                accountColor: account?.color || '#6B7280',
                notes: trade.notes,
              };
            }), ...dematTransactions.map(tx => {
              const account = dematAccounts.find(a => a.id === tx.dematAccountId);
              return {
                id: tx.id,
                type: tx.type as 'deposit' | 'withdrawal',
                date: tx.date,
                amount: tx.type === 'deposit' ? tx.amount : -tx.amount,
                accountName: account?.brokerName || 'Unknown',
                accountColor: account?.color || '#6B7280',
                notes: tx.notes,
              };
            })]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 20)
              .map((item) => (
                <div 
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    {item.type === 'trade' ? (
                      item.amount >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )
                    ) : item.type === 'deposit' ? (
                      <ArrowDownCircle className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowUpCircle className="w-4 h-4 text-destructive" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {item.type === 'trade' ? 'Trade P&L' : item.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-background">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: item.accountColor }}
                          />
                          {item.accountName}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(item.date), 'dd MMM yyyy')}
                        {item.notes && <span className="ml-2">• {item.notes}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${item.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {item.amount >= 0 ? '+' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        if (item.type === 'trade') {
                          deleteDailyTrade(item.id);
                        } else {
                          deleteDematTransaction(item.id);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet. Add trades or fund transfers to see them here.
          </div>
        )}
      </div>
    </div>
  );
}
