import { useNipComments } from '@/hooks/useNipComments';
import { CommentForm } from '@/components/CommentForm';
import { Comment } from '@/components/Comment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

interface CommentsSectionProps {
  naddr: string;
}

export function CommentsSection({ naddr }: CommentsSectionProps) {
  const { data: comments = [], isLoading, error } = useNipComments(naddr);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Failed to load comments</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comments</span>
            {!isLoading && (
              <span className="text-sm font-normal text-muted-foreground">
                ({comments.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          <CommentForm naddr={naddr} />

          {/* Comments List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No comments yet</p>
              <p className="text-sm">Be the first to share your thoughts on this NIP!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  naddr={naddr}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}