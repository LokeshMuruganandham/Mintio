import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingNav } from '@/components/FloatingNav';
import { Dashboard } from '@/components/Dashboard';
import { ExpenseForm } from '@/components/ExpenseForm';
import { InvestmentTracker } from '@/components/InvestmentTracker';
import { IntradayTracker } from '@/components/IntradayTracker';
import { BankAccountManager } from '@/components/BankAccountManager';
import { SplitExpenseManager } from '@/components/SplitExpenseManager';
import { ExpenseHistory } from '@/components/ExpenseHistory';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, User } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'add':
        return <ExpenseForm />;
      case 'banks':
        return <BankAccountManager />;
      case 'investments':
        return <InvestmentTracker />;
      case 'trading':
        return <IntradayTracker />;
      case 'transactions':
        return <TransactionHistory />;
      case 'splits':
        return <SplitExpenseManager />;
      case 'history':
        return <ExpenseHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-6xl flex items-center justify-between">
          <h1 className="font-mono font-bold text-lg text-foreground">MoneyFlow</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm font-mono hidden sm:inline">{user.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="font-mono"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-20 pb-32 max-w-6xl">
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>

      <FloatingNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
