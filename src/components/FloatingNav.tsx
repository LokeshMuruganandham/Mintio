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
  { id: 'splits', icon: Users, label: 'Splits' },
  { id: 'history', icon: Receipt, label: 'Expenses' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function FloatingNav({ activeTab, onTabChange }: FloatingNavProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass rounded-2xl p-2 shadow-float animate-slide-up">
        <div className="flex items-center gap-1">
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
                  "relative flex items-center gap-2 px-3 py-3 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span 
                  className={cn(
                    "text-sm font-medium overflow-hidden transition-all duration-300",
                    isActive || isHovered ? "max-w-32 opacity-100" : "max-w-0 opacity-0"
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
