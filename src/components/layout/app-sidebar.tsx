import { Link, useLocation, useParams } from 'react-router';
import { FolderKanbanIcon, KanbanIcon, SettingsIcon } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
            <KanbanIcon className="size-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm leading-tight font-semibold">
              Project Management
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname === '/'}
                  tooltip="All workspaces"
                  render={
                    <Link to="/">
                      <FolderKanbanIcon />
                      <span>All workspaces</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {workspaceId && (
          <SidebarGroup>
            <SidebarGroupLabel>Current workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={
                      location.pathname === `/workspaces/${workspaceId}`
                    }
                    tooltip="Projects"
                    render={
                      <Link to={`/workspaces/${workspaceId}`}>
                        <KanbanIcon />
                        <span>Projects</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={
                      location.pathname ===
                      `/workspaces/${workspaceId}/settings`
                    }
                    tooltip="Members & settings"
                    render={
                      <Link to={`/workspaces/${workspaceId}/settings`}>
                        <SettingsIcon />
                        <span>Members & settings</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
