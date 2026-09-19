import { useState } from 'react';
import { Link } from 'react-router';
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  MoreVerticalIcon,
  PencilIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useArchiveProjectMutation,
  useRestoreProjectMutation,
} from '@/features/projects/projects-api';
import { EditProjectDialog } from '@/features/projects/components/edit-project-dialog';
import { getErrorMessage } from '@/lib/error-message';
import type { Project } from '@/types/api';

interface ProjectCardProps {
  project: Project;
  canEdit: boolean;
  canArchive: boolean;
}

export function ProjectCard({
  project,
  canEdit,
  canArchive,
}: ProjectCardProps) {
  const [archiveProject] = useArchiveProjectMutation();
  const [restoreProject] = useRestoreProjectMutation();
  const [isEditing, setIsEditing] = useState(false);

  async function handleArchive() {
    try {
      await archiveProject({
        workspaceId: project.workspaceId,
        projectId: project.id,
      }).unwrap();
      toast.success('Project archived');
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  async function handleRestore() {
    try {
      await restoreProject({
        workspaceId: project.workspaceId,
        projectId: project.id,
      }).unwrap();
      toast.success('Project restored');
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  const canManage = canEdit || canArchive;

  return (
    <Card
      className={
        project.archivedAt ? 'opacity-60' : 'transition-shadow hover:shadow-md'
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/workspaces/${project.workspaceId}/projects/${project.id}`}
            className="min-w-0"
          >
            <CardTitle className="truncate text-base hover:underline">
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </Link>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Manage ${project.name}`}
                  >
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <PencilIcon /> Edit
                  </DropdownMenuItem>
                )}
                {canEdit && canArchive && <DropdownMenuSeparator />}
                {canArchive &&
                  (project.archivedAt ? (
                    <DropdownMenuItem onClick={handleRestore}>
                      <ArchiveRestoreIcon /> Restore
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleArchive}>
                      <ArchiveIcon /> Archive
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {canEdit && (
        <EditProjectDialog
          project={project}
          open={isEditing}
          onOpenChange={setIsEditing}
        />
      )}
    </Card>
  );
}
