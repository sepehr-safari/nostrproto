import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { NostrEvent } from '@nostrify/nostrify';

export function useOfficialNipComments(nipNumber: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['official-nip-comments', nipNumber],
    queryFn: async ({ signal }) => {
      const githubUrl = `https://github.com/nostr-protocol/nips/blob/master/${nipNumber}.md`;
      
      // Query for all kind 1111 comments that reference this official NIP regardless of depth
      const allComments = await nostr.query(
        [{
          kinds: [1111],
          '#I': [githubUrl],
          limit: 500,
        }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) }
      );

      // Query for deletion events (kind 5) that might reference these comments
      const commentIds = allComments.map(comment => comment.id);
      const deletionEvents = commentIds.length > 0 ? await nostr.query(
        [{
          kinds: [5],
          '#e': commentIds,
          limit: 500,
        }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) }
      ) : [];

      // Create a set of deleted comment IDs
      const deletedCommentIds = new Set<string>();
      for (const deletion of deletionEvents) {
        // Only consider deletion events from the same author as the original comment
        const referencedEventIds = deletion.tags
          .filter(([tagName]) => tagName === 'e')
          .map(([, eventId]) => eventId);
        
        for (const eventId of referencedEventIds) {
          const originalComment = allComments.find(c => c.id === eventId);
          if (originalComment && originalComment.pubkey === deletion.pubkey) {
            deletedCommentIds.add(eventId);
          }
        }
      }

      // Filter out deleted comments
      const activeComments = allComments.filter(comment => !deletedCommentIds.has(comment.id));

      // Helper function to get lowercase tag value
      const getLowercaseTag = (event: NostrEvent, tagName: string): string | undefined => {
        const tag = event.tags.find(([name]) => name === tagName);
        return tag?.[1];
      };

      // Filter top-level comments (those with lowercase "i" tag matching the GitHub URL)
      const topLevelComments = activeComments.filter(comment => {
        const iTag = getLowercaseTag(comment, 'i');
        return iTag === githubUrl;
      });

      // Helper function to get all descendants of a comment
      const getDescendants = (parentId: string): NostrEvent[] => {
        const directReplies = activeComments.filter(comment => {
          const eTag = getLowercaseTag(comment, 'e');
          return eTag === parentId;
        });

        const allDescendants = [...directReplies];
        
        // Recursively get descendants of each direct reply
        for (const reply of directReplies) {
          allDescendants.push(...getDescendants(reply.id));
        }

        return allDescendants;
      };

      // Create a map of comment ID to its descendants
      const commentDescendants = new Map<string, NostrEvent[]>();
      for (const comment of activeComments) {
        commentDescendants.set(comment.id, getDescendants(comment.id));
      }

      // Sort top-level comments by creation time (newest first)
      const sortedTopLevel = topLevelComments.sort((a, b) => b.created_at - a.created_at);

      return {
        allComments: activeComments,
        topLevelComments: sortedTopLevel,
        deletedCommentIds,
        getDescendants: (commentId: string) => {
          const descendants = commentDescendants.get(commentId) || [];
          // Sort descendants by creation time (oldest first for threaded display)
          return descendants.sort((a, b) => a.created_at - b.created_at);
        },
        getDirectReplies: (commentId: string) => {
          const directReplies = activeComments.filter(comment => {
            const eTag = getLowercaseTag(comment, 'e');
            return eTag === commentId;
          });
          // Sort direct replies by creation time (oldest first for threaded display)
          return directReplies.sort((a, b) => a.created_at - b.created_at);
        }
      };
    },
    enabled: !!nipNumber,
  });
}