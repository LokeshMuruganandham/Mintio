import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingNav } from '@/components/FloatingNav';
import { Dashboard } from '@/components/Dashboard';
import { ExpenseForm } from '@/components/ExpenseForm';
import { InvestmentTracker } from '@/components/InvestmentTracker';
import { IntradayTracker } from '@/components/IntradayTracker';
import { SplitExpenseManager } from '@/components/SplitExpenseManager';
import { ExpenseHistory } from '@/components/ExpenseHistory';
import { ProfileManager } from '@/components/ProfileManager';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'add':
        return <ExpenseForm />;
      case 'investments':
        return <InvestmentTracker />;
      case 'trading':
        return <IntradayTracker />;
      case 'splits':
        return <SplitExpenseManager />;
      case 'history':
        return <ExpenseHistory />;
      case 'profile':
        return <ProfileManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-28 max-w-3xl">
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>

      <FloatingNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
