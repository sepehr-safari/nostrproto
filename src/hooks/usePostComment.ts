import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { nip19 } from 'nostr-tools';
import { NostrEvent } from '@nostrify/nostrify';

interface PostCommentParams {
  content: string;
  naddr: string;
  parentComment?: NostrEvent;
}

export function usePostComment() {
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, naddr, parentComment }: PostCommentParams) => {
      const decoded = nip19.decode(naddr);
      
      if (decoded.type !== 'naddr') {
        throw new Error('Invalid naddr format');
      }

      const addr = decoded.data;
      const addrString = `${addr.kind}:${addr.pubkey}:${addr.identifier}`;

      const tags: string[][] = [
        // Root content tags (uppercase)
        ['A', addrString],
        ['K', addr.kind.toString()],
        ['P', addr.pubkey],
      ];

      if (parentComment) {
        // This is a reply to another comment
        tags.push(
          // Parent comment tags (lowercase)
          ['e', parentComment.id],
          ['k', '1111'],
          ['p', parentComment.pubkey],
          // Still reference the root content
          ['a', addrString]
        );
      } else {
        // This is a top-level comment on the NIP
        tags.push(
          // Parent is the same as root for top-level comments
          ['a', addrString],
          ['k', addr.kind.toString()],
          ['p', addr.pubkey]
        );
      }

      const event = await publishEvent({
        kind: 1111,
        content,
        tags,
      });

      return event;
    },
    onSuccess: (_, { naddr, parentComment }) => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ['nip-comments', naddr] });
      
      // If this was a reply, also invalidate the parent comment's replies
      if (parentComment) {
        queryClient.invalidateQueries({ queryKey: ['comment-replies', parentComment.id] });
      }
    },
  });
}