import { Link } from 'react-router-dom';
import { useAuthor } from '@/hooks/useAuthor';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { nip19 } from 'nostr-tools';
import { NostrEvent } from '@/types/nostr';

interface CustomNipCardProps {
  event: NostrEvent;
  /** Maximum number of kinds to display before showing "+X more" */
  maxKinds?: number;
  /** Additional CSS classes */
  className?: string;
  /** Optional actions slot for additional buttons */
  actions?: React.ReactNode;
}

export function CustomNipCard({ 
  event, 
  maxKinds = 2, 
  className = "",
  actions
}: CustomNipCardProps) {
  const author = useAuthor(event.pubkey);
  const title = event.tags.find((tag: string[]) => tag[0] === 'title')?.[1] || 'Untitled NIP';
  const kinds = event.tags.filter((tag: string[]) => tag[0] === 'k').map((tag: string[]) => tag[1]);
  const dTag = event.tags.find((tag: string[]) => tag[0] === 'd')?.[1] || '';
  
  const naddr = nip19.naddrEncode({
    identifier: dTag,
    pubkey: event.pubkey,
    kind: event.kind,
  });

  return (
    <Card className={`glass border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 group ${className}`}>
      <CardContent className="p-3 sm:p-4 card-content">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/${naddr}`} className="flex-1 min-w-0">
              <h3 className="font-semibold text-accent group-hover:text-primary transition-colors text-sm sm:text-base leading-tight hover:underline">
                {title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-xs">
                Custom
              </Badge>
              {actions}
            </div>
          </div>
          
          {kinds.length > 0 && (
            <div className="flex items-center flex-wrap gap-1">
              <span className="text-xs text-muted-foreground flex-shrink-0">Kinds:</span>
              {kinds.slice(0, maxKinds).map(kind => (
                <Link key={kind} to={`/kind/${kind}`}>
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                    {kind}
                  </Badge>
                </Link>
              ))}
              {kinds.length > maxKinds && (
                <span className="text-xs text-muted-foreground">+{kinds.length - maxKinds} more</span>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2 min-w-0">
            <Avatar className="h-5 w-5 sm:h-6 sm:w-6 ring-2 ring-accent/20 flex-shrink-0">
              <AvatarImage src={author.data?.metadata?.picture} />
              <AvatarFallback className="text-xs bg-accent/10 text-accent">
                {author.data?.metadata?.name?.[0] || event.pubkey.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors truncate min-w-0 flex-1">
              {author.data?.metadata?.display_name || author.data?.metadata?.name || `${event.pubkey.slice(0, 8)}...`}
            </span>
            <span className="text-xs text-muted-foreground/60 flex-shrink-0">
              {new Date(event.created_at * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

