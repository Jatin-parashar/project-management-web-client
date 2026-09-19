export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'GUEST';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const MODERATOR_ROLES: Role[] = ['OWNER', 'ADMIN', 'MANAGER'];

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSummary extends Workspace {
  myRole: Role;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: Role;
  createdAt: string;
}

export interface WorkspaceMemberWithUser extends WorkspaceMember {
  user: PublicUser;
}

export interface WorkspaceDetail extends Workspace {
  members: WorkspaceMemberWithUser[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  createdById: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: PublicUser;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  position: number;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  taskId: string;
  uploadedById: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  publicId: string;
  resourceType: string;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  workspaceId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
