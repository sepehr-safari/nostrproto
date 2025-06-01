import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { nip19 } from 'nostr-tools';
import { NostrEvent } from '@nostrify/nostrify';

export function useNipComments(naddr: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nip-comments', naddr],
    queryFn: async ({ signal }) => {
      const decoded = nip19.decode(naddr);
      
      if (decoded.type !== 'naddr') {
        throw new Error('Invalid naddr format');
      }

      const addr = decoded.data;
      
      // Query for kind 1111 comments that reference this NIP
      const comments = await nostr.query(
        [{
          kinds: [1111],
          '#a': [`${addr.kind}:${addr.pubkey}:${addr.identifier}`],
          limit: 100,
        }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) }
      );

      // Sort comments by creation time (newest first)
      return comments.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!naddr,
  });
}

export function useCommentReplies(commentId: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['comment-replies', commentId],
    queryFn: async ({ signal }) => {
      // Query for kind 1111 comments that reply to this comment
      const replies = await nostr.query(
        [{
          kinds: [1111],
          '#e': [commentId],
          limit: 50,
        }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) }
      );

      // Sort replies by creation time (oldest first for threaded display)
      return replies.sort((a, b) => a.created_at - b.created_at);
    },
    enabled: !!commentId,
  });
}