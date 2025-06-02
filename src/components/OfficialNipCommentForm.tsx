import { useState } from 'react';
import { usePostOfficialNipComment } from '@/hooks/usePostOfficialNipComment';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { LoginArea } from '@/components/auth/LoginArea';
import { MessageSquare, Send } from 'lucide-react';
import { NostrEvent } from '@nostrify/nostrify';

interface OfficialNipCommentFormProps {
  nipNumber: string;
  parentComment?: NostrEvent;
  onCancel?: () => void;
  placeholder?: string;
}

export function OfficialNipCommentForm({ 
  nipNumber, 
  parentComment, 
  onCancel, 
  placeholder = "Share your thoughts on this NIP..." 
}: OfficialNipCommentFormProps) {
  const [content, setContent] = useState('');
  const { user } = useCurrentUser();
  const { mutate: postComment, isPending } = usePostOfficialNipComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    postComment(
      { content: content.trim(), nipNumber, parentComment },
      {
        onSuccess: () => {
          setContent('');
          onCancel?.();
        },
      }
    );
  };

  if (!user) {
    return (
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Sign in to comment</span>
            </div>
            <LoginArea className="max-w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] resize-none"
            disabled={isPending}
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {parentComment ? 'Replying to comment' : 'Commenting on NIP'}
            </div>
            <div className="flex items-center space-x-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isPending}
              >
                <Send className="h-3 w-3 mr-1" />
                {isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}