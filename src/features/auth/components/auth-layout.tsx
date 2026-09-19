import type { ReactNode } from 'react';
import { KanbanIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="bg-muted/30 flex min-h-svh flex-col items-center justify-center gap-6 p-4 sm:p-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
          <KanbanIcon className="size-4" />
        </div>
        Project Management
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="text-muted-foreground justify-center text-sm">
          {footer}
        </CardFooter>
      </Card>
    </div>
  );
}
