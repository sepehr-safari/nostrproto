import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { NostrEvent } from '@nostrify/nostrify';

interface PostOfficialNipCommentParams {
  content: string;
  nipNumber: string;
  parentComment?: NostrEvent;
}

export function usePostOfficialNipComment() {
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, nipNumber, parentComment }: PostOfficialNipCommentParams) => {
      const githubUrl = `https://github.com/nostr-protocol/nips/blob/master/${nipNumber}.md`;

      const tags: string[][] = [
        // Root content tags (uppercase)
        ['I', githubUrl],
        // Root kind: for URLs, the kind is the domain
        ['K', 'https://github.com'],
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
        // This is a top-level comment on the official NIP
        // Include lowercase tags that match the root content
        tags.push(
          ['i', githubUrl],
          ['k', 'https://github.com']
        );
      }

      const event = await publishEvent({
        kind: 1111,
        content,
        tags,
      });

      return event;
    },
    onSuccess: (_, { nipNumber }) => {
      // Invalidate and refetch all comments for this official NIP
      queryClient.invalidateQueries({ queryKey: ['official-nip-comments', nipNumber] });
    },
  });
}