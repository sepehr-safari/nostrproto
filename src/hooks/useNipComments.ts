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
      const addrString = `${addr.kind}:${addr.pubkey}:${addr.identifier}`;
      
      // Query for all kind 1111 comments that reference this NIP regardless of depth
      const allComments = await nostr.query(
        [{
          kinds: [1111],
          '#A': [addrString],
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

      // Filter top-level comments (those with lowercase "a" tag matching the NIP addr)
      const topLevelComments = activeComments.filter(comment => {
        const aTag = getLowercaseTag(comment, 'a');
        return aTag === addrString;
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
    enabled: !!naddr,
  });
}