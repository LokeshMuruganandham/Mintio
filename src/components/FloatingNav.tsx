import { useState } from 'react';
import { LayoutDashboard, Plus, Rocket, Users, Receipt, BarChart2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'add', icon: Plus, label: 'Add' },
  { id: 'investments', icon: Rocket, label: 'Ventures' },
  { id: 'trading', icon: BarChart2, label: 'Trading' },
  { id: 'history', icon: Receipt, label: 'Expenses' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function FloatingNav({ activeTab, onTabChange }: FloatingNavProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md sm:max-w-lg">
      <div className="glass rounded-2xl p-1.5 sm:p-2 shadow-float animate-slide-up">
        <div className="flex items-center justify-between sm:justify-center sm:gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isHovered = hoveredItem === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "relative flex items-center justify-center gap-1.5 px-2.5 py-2.5 sm:px-3 sm:py-3 rounded-xl transition-all duration-300 flex-1 sm:flex-initial",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span 
                  className={cn(
                    "text-xs font-medium overflow-hidden transition-all duration-300 hidden sm:block",
                    isActive || isHovered ? "max-w-24 opacity-100" : "max-w-0 opacity-0"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
