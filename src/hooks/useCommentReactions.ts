import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';
import type { NostrEvent } from '@nostrify/nostrify';

export interface ReactionData {
  content: string;
  count: number;
  users: string[]; // pubkeys of users who reacted
  hasUserReacted: boolean;
}

export function useCommentReactions(comment: NostrEvent | undefined) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['comment-reactions', comment?.id],
    queryFn: async () => {
      if (!comment) return [];

      const signal = AbortSignal.timeout(3000);
      
      // Query for all reactions to this comment
      const reactions = await nostr.query([
        {
          kinds: [7],
          '#e': [comment.id],
        }
      ], { signal });

      // Group reactions by content (emoji/reaction type)
      const reactionMap = new Map<string, { users: string[], events: NostrEvent[] }>();
      
      reactions.forEach(reaction => {
        const content = reaction.content || '+'; // Treat empty as '+'
        if (!reactionMap.has(content)) {
          reactionMap.set(content, { users: [], events: [] });
        }
        
        const group = reactionMap.get(content)!;
        // Only count one reaction per user per reaction type (latest wins)
        const existingIndex = group.users.indexOf(reaction.pubkey);
        if (existingIndex >= 0) {
          // Replace if this reaction is newer
          if (reaction.created_at > group.events[existingIndex].created_at) {
            group.events[existingIndex] = reaction;
          }
        } else {
          group.users.push(reaction.pubkey);
          group.events.push(reaction);
        }
      });

      // Convert to ReactionData array
      const reactionData: ReactionData[] = [];
      reactionMap.forEach((group, content) => {
        reactionData.push({
          content,
          count: group.users.length,
          users: group.users,
          hasUserReacted: user ? group.users.includes(user.pubkey) : false,
        });
      });

      // Sort by count (most popular first), then by content
      return reactionData.sort((a, b) => {
        if (a.count !== b.count) return b.count - a.count;
        return a.content.localeCompare(b.content);
      });
    },
    enabled: !!comment,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}