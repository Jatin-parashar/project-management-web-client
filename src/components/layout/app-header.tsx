import { LogOutIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/shared/mode-toggle';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import { useLogoutMutation } from '@/features/auth/auth-api';

export function AppHeader() {
  const user = useAppSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();

  return (
    <header className="bg-background/95 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger />

      <div className="flex items-center gap-2">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Open account menu"
                className="focus-visible:ring-ring/50 rounded-full focus-visible:ring-3 focus-visible:outline-none"
              >
                <Avatar>
                  <AvatarFallback>
                    {user?.email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground font-normal">
                {user?.email}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout()}>
              <LogOutIcon /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
