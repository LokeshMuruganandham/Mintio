import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  size?: 'default' | 'large';
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  className,
  size = 'default'
}: StatCardProps) {
  return (
    <div className={cn("bento-item group", className)}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-secondary text-foreground transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        )}
      </div>
      
      <div className={cn(
        "font-semibold tracking-tight",
        size === 'large' ? "text-4xl" : "text-2xl"
      )}>
        {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
      </div>
      
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && trend !== 'neutral' && (
            <span className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend === 'up' ? "text-success" : "text-destructive"
            )}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
