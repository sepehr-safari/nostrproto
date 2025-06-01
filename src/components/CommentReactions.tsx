import { useState } from 'react';
import { NostrEvent } from '@nostrify/nostrify';
import { useCommentReactions } from '@/hooks/useCommentReactions';
import { useReactToComment } from '@/hooks/useReactToComment';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentReactionsProps {
  comment: NostrEvent;
  className?: string;
}

// Common emoji reactions (Slack-style)
const COMMON_REACTIONS = [
  '👍', '👎', '❤️', '😂', '😮', '😢', '😡',
  '🎉', '🔥', '👀', '💯', '🚀', '✅', '❌'
];

export function CommentReactions({ comment, className }: CommentReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useCurrentUser();
  const { data: reactions = [], isLoading } = useCommentReactions(comment);
  const { mutate: reactToComment, isPending } = useReactToComment();

  const handleReaction = (reaction: string) => {
    if (!user) return;
    reactToComment({ comment, reaction });
    setShowEmojiPicker(false);
  };

  const handleToggleReaction = (reaction: string, hasUserReacted: boolean) => {
    if (!user) return;
    
    if (hasUserReacted) {
      // To remove a reaction, we would need to send a deletion event
      // For now, we'll just add the same reaction again (some clients handle this as toggle)
      reactToComment({ comment, reaction });
    } else {
      reactToComment({ comment, reaction });
    }
  };

  // Don't show anything if no reactions and user is not logged in
  if (!user && reactions.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {/* Existing reactions */}
      {reactions.map((reactionData) => (
        <TooltipProvider key={reactionData.content}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleReaction(reactionData.content, reactionData.hasUserReacted)}
                disabled={!user || isPending}
                className={cn(
                  "h-7 px-2 py-1 text-xs rounded-full border transition-all",
                  reactionData.hasUserReacted 
                    ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20" 
                    : "bg-muted/50 border-muted hover:bg-muted",
                  isPending && "opacity-50"
                )}
              >
                <span className="mr-1">{reactionData.content}</span>
                <span className="font-medium">{reactionData.count}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {reactionData.count} {reactionData.count === 1 ? 'person' : 'people'} reacted with {reactionData.content}
                {reactionData.hasUserReacted && ' (including you)'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* Add reaction button */}
      {user && (
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              disabled={isPending}
            >
              {isLoading ? (
                <Smile className="h-3 w-3 animate-pulse" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Add a reaction</h4>
              <div className="grid grid-cols-7 gap-1">
                {COMMON_REACTIONS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(emoji)}
                    className="h-8 w-8 p-0 text-lg hover:bg-muted rounded"
                    disabled={isPending}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction('+')}
                  className="w-full justify-start text-xs"
                  disabled={isPending}
                >
                  👍 Like
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction('-')}
                  className="w-full justify-start text-xs"
                  disabled={isPending}
                >
                  👎 Dislike
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}