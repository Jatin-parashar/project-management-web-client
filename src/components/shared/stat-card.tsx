import { cn } from 'cn';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  valueClassName,
}: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <div
          className={cn(
            'text-muted-foreground mb-1 flex items-center gap-2',
            iconClassName,
          )}
        >
          <Icon className="size-4" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className={cn('text-2xl font-bold tabular-nums', valueClassName)}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
