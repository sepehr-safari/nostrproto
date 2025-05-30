import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function useMyNips() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['my-nips', user?.pubkey],
    queryFn: async ({ signal }) => {
      if (!user?.pubkey) {
        throw new Error('User not logged in');
      }

      const events = await nostr.query(
        [{
          kinds: [30817],
          authors: [user.pubkey],
          limit: 50,
        }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) }
      );

      return events.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!user?.pubkey,
  });
}