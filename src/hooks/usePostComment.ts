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
        // This is a reply to another comment (nested reply)
        // Only include lowercase tags for the parent comment, NOT the root content
        tags.push(
          ['e', parentComment.id],
          ['k', '1111'],
          ['p', parentComment.pubkey]
        );
      } else {
        // This is a top-level comment on the NIP
        // Include lowercase tags that match the root content
        tags.push(
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
    onSuccess: (_, { naddr }) => {
      // Invalidate and refetch all comments for this NIP
      queryClient.invalidateQueries({ queryKey: ['nip-comments', naddr] });
    },
  });
}