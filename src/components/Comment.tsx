import { useState } from 'react';
import { NostrEvent } from '@nostrify/nostrify';
import { useAuthor } from '@/hooks/useAuthor';
import { useCommentReplies } from '@/hooks/useNipComments';
import { CommentForm } from '@/components/CommentForm';
import { NoteContent } from '@/components/NoteContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentProps {
  comment: NostrEvent;
  naddr: string;
  depth?: number;
  maxDepth?: number;
}

export function Comment({ comment, naddr, depth = 0, maxDepth = 3 }: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2); // Auto-expand first 2 levels
  
  const author = useAuthor(comment.pubkey);
  const { data: replies = [], isLoading: repliesLoading } = useCommentReplies(comment.id);
  
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || `${comment.pubkey.slice(0, 8)}...`;
  const timeAgo = formatDistanceToNow(new Date(comment.created_at * 1000), { addSuffix: true });

  const hasReplies = replies.length > 0;
  const canNest = depth < maxDepth;

  return (
    <div className={`space-y-3 ${depth > 0 ? 'ml-6 border-l-2 border-muted pl-4' : ''}`}>
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Comment Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={metadata?.picture} />
                  <AvatarFallback className="text-xs">
                    {metadata?.name?.[0] || comment.pubkey.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                </div>
              </div>
            </div>

            {/* Comment Content */}
            <div className="text-sm">
              <NoteContent event={comment} className="text-sm" />
            </div>

            {/* Comment Actions */}
            <div className="flex items-center space-x-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-8 px-2 text-xs"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Reply
              </Button>
              
              {hasReplies && (
                <Collapsible open={showReplies} onOpenChange={setShowReplies}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                      {showReplies ? (
                        <ChevronDown className="h-3 w-3 mr-1" />
                      ) : (
                        <ChevronRight className="h-3 w-3 mr-1" />
                      )}
                      {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="ml-6">
          <CommentForm
            naddr={naddr}
            parentComment={comment}
            onSuccess={() => setShowReplyForm(false)}
            placeholder="Write a reply..."
            compact
          />
        </div>
      )}

      {/* Replies */}
      {hasReplies && (
        <Collapsible open={showReplies} onOpenChange={setShowReplies}>
          <CollapsibleContent className="space-y-3">
            {repliesLoading ? (
              <div className="ml-6 text-sm text-muted-foreground">Loading replies...</div>
            ) : (
              replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  naddr={naddr}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}