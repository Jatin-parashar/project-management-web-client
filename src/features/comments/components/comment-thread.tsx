import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2Icon, PencilIcon, SendIcon, Trash2Icon } from 'lucide-react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useListCommentsQuery,
  useUpdateCommentMutation,
} from '@/features/comments/comments-api';
import { getErrorMessage } from '@/lib/error-message';
import type { Comment } from '@/types/api';

interface CommentThreadProps {
  projectId: string;
  taskId: string;
  currentUserId: string;
  canModerate: boolean;
}

export function CommentThread({
  projectId,
  taskId,
  currentUserId,
  canModerate,
}: CommentThreadProps) {
  const { data: comments, isLoading } = useListCommentsQuery({
    projectId,
    taskId,
  });
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [content, setContent] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    try {
      await createComment({
        projectId,
        taskId,
        content: content.trim(),
      }).unwrap();
      setContent('');
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Comments</h3>

      {isLoading && <Skeleton className="h-16 rounded-lg" />}

      <div className="flex flex-col gap-3">
        {comments?.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            projectId={projectId}
            taskId={taskId}
            canEdit={comment.authorId === currentUserId}
            canDelete={comment.authorId === currentUserId || canModerate}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment"
          rows={2}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isCreating || !content.trim()}
          aria-label="Post comment"
        >
          {isCreating ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
        </Button>
      </form>
    </div>
  );
}

interface CommentRowProps {
  comment: Comment;
  projectId: string;
  taskId: string;
  canEdit: boolean;
  canDelete: boolean;
}

function CommentRow({
  comment,
  projectId,
  taskId,
  canEdit,
  canDelete,
}: CommentRowProps) {
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  async function handleSave() {
    if (!draft.trim()) return;
    try {
      await updateComment({
        projectId,
        taskId,
        commentId: comment.id,
        content: draft.trim(),
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  async function handleDelete() {
    try {
      await deleteComment({
        projectId,
        taskId,
        commentId: comment.id,
      }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  return (
    <div className="group flex items-start gap-2.5">
      <Avatar size="sm">
        <AvatarFallback>
          {comment.author.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{comment.author.name}</span>
          <span className="text-muted-foreground text-xs">
            {new Date(comment.createdAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>
        {isEditing ? (
          <div className="mt-1 flex flex-col gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                {isUpdating && <Loader2Icon className="animate-spin" />}
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setDraft(comment.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>
      {!isEditing && (canEdit || canDelete) && (
        <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
          {canEdit && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit comment"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon className="size-3.5" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete comment"
              onClick={handleDelete}
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
