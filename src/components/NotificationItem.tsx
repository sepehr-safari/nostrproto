import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle } from 'lucide-react';
import { NostrEvent } from '@/types/nostr';
import { NoteContent } from '@/components/NoteContent';
import { nip19 } from 'nostr-tools';

interface NotificationItemProps {
  event: NostrEvent;
}

export function NotificationItem({ event }: NotificationItemProps) {
  const author = useAuthor(event.pubkey);
  const metadata = author.data?.metadata;
  
  const displayName = metadata?.name ?? genUserName(event.pubkey);
  const profileImage = metadata?.picture;
  
  // Get the referenced NIP from the 'a' tag
  const aTag = event.tags.find(tag => tag[0] === 'a')?.[1];
  const nipTitle = getNipTitle(aTag);
  
  const isReaction = event.kind === 7;
  const isComment = event.kind === 1111;
  
  const timeAgo = formatDistanceToNow(new Date(event.created_at * 1000), { addSuffix: true });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">{displayName}</span>
              {isReaction && (
                <Badge variant="secondary" className="text-xs">
                  <Heart className="h-3 w-3 mr-1" />
                  Liked
                </Badge>
              )}
              {isComment && (
                <Badge variant="secondary" className="text-xs">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Commented
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
            
            <div className="text-sm text-muted-foreground mb-2">
              {isReaction && 'liked your NIP'}
              {isComment && 'commented on your NIP'}
              {nipTitle && (
                <span className="font-medium text-foreground">
                  {' "'}
                  {nipTitle}
                  {'"'}
                </span>
              )}
            </div>
            
            {isComment && event.content && (
              <div className="text-sm bg-muted/50 rounded-md p-2 mt-2">
                <NoteContent event={event} className="text-sm" />
              </div>
            )}
            
            {aTag && (
              <div className="mt-2">
                <Link 
                  to={`/${createNaddrFromATag(aTag)}`}
                  className="text-xs text-primary hover:underline"
                >
                  View NIP →
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getNipTitle(aTag: string | undefined): string | null {
  if (!aTag) return null;
  
  // aTag format: "kind:pubkey:identifier"
  const parts = aTag.split(':');
  if (parts.length >= 3) {
    const identifier = parts[2];
    // Try to extract a readable title from the identifier
    // This is a simple heuristic - in a real app you might want to fetch the actual event
    return identifier.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return null;
}

function createNaddrFromATag(aTag: string): string {
  const parts = aTag.split(':');
  if (parts.length >= 3) {
    const [kind, pubkey, identifier] = parts;
    
    try {
      return nip19.naddrEncode({
        identifier,
        pubkey,
        kind: parseInt(kind, 10),
      });
    } catch (error) {
      console.warn('Failed to encode naddr:', error);
      return aTag;
    }
  }
  
  return aTag;
}