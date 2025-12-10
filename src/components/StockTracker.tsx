import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useExpenses } from '@/hooks/useExpenses';
import { toast } from 'sonner';
import { TrendingUp, Plus, Trash2, BarChart3 } from 'lucide-react';

export function StockTracker() {
  const { stocks, addStock, deleteStock, totalStockInvestments } = useExpenses();
  const [stockName, setStockName] = useState('');
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stockName.trim()) {
      toast.error('Please enter stock name');
      return;
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter quantity');
      return;
    }

    if (!buyPrice || parseFloat(buyPrice) <= 0) {
      toast.error('Please enter buy price');
      return;
    }

    addStock({
      stockName: stockName.trim(),
      ticker: ticker.trim().toUpperCase() || undefined,
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
      date,
      notes: notes.trim() || undefined,
    });

    toast.success('Stock investment recorded');
    
    setStockName('');
    setTicker('');
    setQuantity('');
    setBuyPrice('');
    setNotes('');
  };

  // Group stocks by name
  const stocksByName = stocks.reduce((acc, stock) => {
    const key = stock.stockName;
    if (!acc[key]) {
      acc[key] = { stocks: [], totalQuantity: 0, totalInvested: 0, ticker: stock.ticker };
    }
    acc[key].stocks.push(stock);
    acc[key].totalQuantity += stock.quantity;
    acc[key].totalInvested += stock.quantity * stock.buyPrice;
    return acc;
  }, {} as Record<string, { stocks: typeof stocks; totalQuantity: number; totalInvested: number; ticker?: string }>);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bento-item bg-gradient-to-br from-secondary to-background">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Total Stock Investments
            </span>
            <div className="text-4xl font-bold mt-2">
              ₹{totalStockInvestments.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Across {Object.keys(stocksByName).length} stocks
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-primary/10">
            <TrendingUp className="w-8 h-8 text-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Stock Form */}
        <form onSubmit={handleSubmit} className="bento-item">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Record Stock Purchase
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Stock Name
                </Label>
                <Input
                  placeholder="e.g., Reliance"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Ticker (Optional)
                </Label>
                <Input
                  placeholder="e.g., RELIANCE"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Quantity
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-12"
                  step="1"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Buy Price (₹)
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
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
                placeholder="Investment thesis, target price, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Plus className="w-4 h-4" />
              Add Stock
            </Button>
          </div>
        </form>

        {/* Stocks Portfolio */}
        <div className="bento-item">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Portfolio
          </h3>

          {Object.keys(stocksByName).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No stocks in portfolio yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(stocksByName).map(([name, data]) => {
                const avgPrice = data.totalInvested / data.totalQuantity;
                return (
                  <div 
                    key={name} 
                    className="p-4 rounded-xl bg-secondary/50 border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{name}</h4>
                        {data.ticker && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {data.ticker}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">
                          ₹{data.totalInvested.toLocaleString('en-IN')}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {data.totalQuantity} shares @ ₹{avgPrice.toFixed(2)} avg
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {data.stocks.map((stock) => (
                        <div 
                          key={stock.id}
                          className="flex items-center justify-between text-sm py-2 border-t border-border/30"
                        >
                          <div>
                            <span className="text-muted-foreground">
                              {new Date(stock.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {stock.quantity} × ₹{stock.buyPrice}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              ₹{(stock.quantity * stock.buyPrice).toLocaleString('en-IN')}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteStock(stock.id)}
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
