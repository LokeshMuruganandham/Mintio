import { useState } from 'react';
import { FloatingNav } from '@/components/FloatingNav';
import { Dashboard } from '@/components/Dashboard';
import { ExpenseForm } from '@/components/ExpenseForm';
import { InvestmentTracker } from '@/components/InvestmentTracker';
import { StockTracker } from '@/components/StockTracker';
import { BankAccountManager } from '@/components/BankAccountManager';
import { SplitExpenseManager } from '@/components/SplitExpenseManager';
import { ExpenseHistory } from '@/components/ExpenseHistory';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      case 'stocks':
        return <StockTracker />;
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
      <main className="container mx-auto px-4 py-8 pb-32 max-w-6xl">
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>

      <FloatingNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
