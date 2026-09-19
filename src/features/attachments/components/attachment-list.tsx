import { useRef } from 'react';
import { toast } from 'sonner';
import { FileIcon, Loader2Icon, PaperclipIcon, Trash2Icon } from 'lucide-react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeleteAttachmentMutation,
  useListAttachmentsQuery,
  useUploadAttachmentMutation,
} from '@/features/attachments/attachments-api';
import { getErrorMessage } from '@/lib/error-message';

interface AttachmentListProps {
  projectId: string;
  taskId: string;
  currentUserId: string;
  canModerate: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({
  projectId,
  taskId,
  currentUserId,
  canModerate,
}: AttachmentListProps) {
  const { data: attachments, isLoading } = useListAttachmentsQuery({
    projectId,
    taskId,
  });
  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      await uploadAttachment({ projectId, taskId, file }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  async function handleDelete(attachmentId: string) {
    try {
      await deleteAttachment({ projectId, taskId, attachmentId }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Attachments</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <PaperclipIcon />
          )}
          Attach file
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {isLoading && <Skeleton className="h-12 rounded-lg" />}

      {attachments?.map((attachment) => (
        <div
          key={attachment.id}
          className="group flex items-center gap-2 rounded-lg border px-2.5 py-2"
        >
          <FileIcon className="text-muted-foreground size-4 shrink-0" />
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-sm hover:underline"
          >
            {attachment.fileName}
          </a>
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatSize(attachment.size)}
          </span>
          {(attachment.uploadedById === currentUserId || canModerate) && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100"
              aria-label={`Delete ${attachment.fileName}`}
              onClick={() => handleDelete(attachment.id)}
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
