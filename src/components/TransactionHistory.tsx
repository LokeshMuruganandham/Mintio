import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenses } from '@/hooks/useExpenses';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { format } from 'date-fns';

type TransactionType = 'all' | 'trade' | 'deposit' | 'withdrawal';
type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

interface UnifiedTransaction {
  id: string;
  type: 'trade' | 'deposit' | 'withdrawal';
  amount: number;
  netAmount: number;
  date: string;
  accountId: string;
  accountName: string;
  accountColor: string;
  notes?: string;
  charges?: number;
  createdAt: string;
}

export function TransactionHistory() {
  const { 
    dematAccounts, 
    dailyTrades, 
    dematTransactions,
    deleteDailyTrade,
    deleteDematTransaction,
  } = useExpenses();

  // Filter states
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Create unified transaction list
  const allTransactions = useMemo<UnifiedTransaction[]>(() => {
    const transactions: UnifiedTransaction[] = [];

    // Add trades
    dailyTrades.forEach(trade => {
      const account = dematAccounts.find(a => a.id === trade.dematAccountId);
      const netPnl = trade.pnl - (trade.charges || 0);
      transactions.push({
        id: trade.id,
        type: 'trade',
        amount: trade.pnl,
        netAmount: netPnl,
        date: trade.date,
        accountId: trade.dematAccountId,
        accountName: account?.brokerName || 'Unknown',
        accountColor: account?.color || '#6B7280',
        notes: trade.notes,
        charges: trade.charges,
        createdAt: trade.createdAt,
      });
    });

    // Add deposits and withdrawals
    dematTransactions.forEach(tx => {
      const account = dematAccounts.find(a => a.id === tx.dematAccountId);
      transactions.push({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        netAmount: tx.type === 'deposit' ? tx.amount : -tx.amount,
        date: tx.date,
        accountId: tx.dematAccountId,
        accountName: account?.brokerName || 'Unknown',
        accountColor: account?.color || '#6B7280',
        notes: tx.notes,
        createdAt: tx.createdAt,
      });
    });

    return transactions;
  }, [dailyTrades, dematTransactions, dematAccounts]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Account filter
    if (accountFilter !== 'all') {
      filtered = filtered.filter(t => t.accountId === accountFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(t => t.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(t => t.date <= dateTo);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.accountName.toLowerCase().includes(query) ||
        t.notes?.toLowerCase().includes(query) ||
        t.type.includes(query)
      );
    }

    // Sort
    switch (sortOrder) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => Math.abs(b.netAmount) - Math.abs(a.netAmount));
        break;
      case 'lowest':
        filtered.sort((a, b) => Math.abs(a.netAmount) - Math.abs(b.netAmount));
        break;
    }

    return filtered;
  }, [allTransactions, typeFilter, accountFilter, dateFrom, dateTo, searchQuery, sortOrder]);

  // Summary stats for filtered transactions
  const stats = useMemo(() => {
    const trades = filteredTransactions.filter(t => t.type === 'trade');
    const deposits = filteredTransactions.filter(t => t.type === 'deposit');
    const withdrawals = filteredTransactions.filter(t => t.type === 'withdrawal');
    
    return {
      totalTrades: trades.length,
      totalDeposits: deposits.reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amount, 0),
      netTradePnl: trades.reduce((sum, t) => sum + t.netAmount, 0),
    };
  }, [filteredTransactions]);

  const handleDelete = (transaction: UnifiedTransaction) => {
    if (transaction.type === 'trade') {
      deleteDailyTrade(transaction.id);
    } else {
      deleteDematTransaction(transaction.id);
    }
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setAccountFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setSortOrder('newest');
  };

  const hasActiveFilters = typeFilter !== 'all' || accountFilter !== 'all' || dateFrom || dateTo || searchQuery;

  const getTransactionIcon = (type: string, amount: number) => {
    switch (type) {
      case 'trade':
        return amount >= 0 
          ? <TrendingUp className="w-4 h-4 text-success" />
          : <TrendingDown className="w-4 h-4 text-destructive" />;
      case 'deposit':
        return <ArrowDownCircle className="w-4 h-4 text-success" />;
      case 'withdrawal':
        return <ArrowUpCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'trade':
        return 'Trade P&L';
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-item">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Trade P&L</span>
          <div className={`text-2xl font-bold mt-1 ${stats.netTradePnl >= 0 ? 'text-success' : 'text-destructive'}`}>
            {stats.netTradePnl >= 0 ? '+' : ''}₹{Math.abs(stats.netTradePnl).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted-foreground">{stats.totalTrades} trades</div>
        </div>
        <div className="bento-item">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Deposits</span>
          <div className="text-2xl font-bold mt-1 text-success">
            +₹{stats.totalDeposits.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bento-item">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Withdrawals</span>
          <div className="text-2xl font-bold mt-1 text-destructive">
            -₹{stats.totalWithdrawals.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bento-item">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Transactions</span>
          <div className="text-2xl font-bold mt-1">{filteredTransactions.length}</div>
          <div className="text-xs text-muted-foreground">of {allTransactions.length} total</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bento-item space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={showFilters ? "secondary" : "outline"} 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-border/50">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="trade">Trades</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Account</Label>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger>
                  <SelectValue />
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
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Sort By</Label>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Amount</SelectItem>
                  <SelectItem value="lowest">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="bento-item">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {allTransactions.length === 0 
              ? "No transactions yet. Add trades or fund transfers to see them here."
              : "No transactions match your filters."
            }
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <div 
                key={`${transaction.type}-${transaction.id}`}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background">
                    {getTransactionIcon(transaction.type, transaction.netAmount)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getTransactionLabel(transaction.type)}</span>
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-background"
                      >
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: transaction.accountColor }}
                        />
                        {transaction.accountName}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(transaction.date), 'dd MMM yyyy')}
                      {transaction.notes && (
                        <span className="ml-2">• {transaction.notes}</span>
                      )}
                      {transaction.type === 'trade' && transaction.charges ? (
                        <span className="ml-2">• Charges: ₹{transaction.charges}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-semibold text-lg ${
                    transaction.netAmount >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {transaction.netAmount >= 0 ? '+' : ''}₹{Math.abs(transaction.netAmount).toLocaleString('en-IN')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-50 hover:opacity-100"
                    onClick={() => handleDelete(transaction)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
