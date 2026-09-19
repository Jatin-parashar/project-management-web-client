import type { ActivityLogEntry } from '@/types/api';

export function formatActivity(
  entry: ActivityLogEntry,
  actorName: string,
): string {
  const meta = entry.metadata ?? {};

  switch (entry.action) {
    case 'workspace.created':
      return `${actorName} created the workspace`;
    case 'workspace.member_added':
      return `${actorName} added a member`;
    case 'workspace.member_role_updated':
      return `${actorName} changed a member's role to ${String(meta.role)}`;
    case 'workspace.member_removed':
      return `${actorName} removed a member`;
    case 'project.created':
      return `${actorName} created project "${String(meta.name)}"`;
    case 'project.updated':
      return `${actorName} updated project "${String(meta.name)}"`;
    case 'project.archived':
      return `${actorName} archived project "${String(meta.name)}"`;
    case 'project.restored':
      return `${actorName} restored project "${String(meta.name)}"`;
    case 'task.created':
      return `${actorName} created task "${String(meta.title)}"`;
    case 'task.updated':
      return `${actorName} updated task "${String(meta.title)}"`;
    case 'task.moved':
      return `${actorName} moved task "${String(meta.title)}" to ${String(meta.status)}`;
    case 'task.deleted':
      return `${actorName} deleted a task`;
    case 'comment.created':
      return `${actorName} commented on a task`;
    case 'comment.updated':
      return `${actorName} edited a comment`;
    case 'comment.deleted':
      return `${actorName} deleted a comment`;
    case 'subtask.created':
      return `${actorName} added subtask "${String(meta.title)}"`;
    case 'subtask.updated':
      return `${actorName} ${meta.completed ? 'completed' : 'reopened'} a subtask`;
    case 'subtask.deleted':
      return `${actorName} deleted a subtask`;
    case 'attachment.created':
      return `${actorName} attached "${String(meta.fileName)}"`;
    case 'attachment.deleted':
      return `${actorName} removed an attachment`;
    default:
      return `${actorName} performed ${entry.action}`;
  }
}
