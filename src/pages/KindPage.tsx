import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useNipsByKind } from '@/hooks/useNipsByKind';
import { useAuthor } from '@/hooks/useAuthor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, AlertCircle, Hash } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { NostrEvent } from '@/types/nostr';
import { genUserName } from '@/lib/genUserName';

export default function KindPage() {
  const { k } = useParams<{ k: string }>();
  const kind = k || '';
  const { data: nips, isLoading, error } = useNipsByKind(kind);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Hash className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Kind {kind} NIPs</h1>
          </div>
          <p className="text-muted-foreground">
            Custom NIPs that define event kind {kind}
          </p>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load NIPs for kind {kind}. Please try again.
              </AlertDescription>
            </Alert>
          ) : nips && nips.length > 0 ? (
            <div className="space-y-4">
              {nips.map((event) => (
                <KindNipCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No NIPs found</h3>
                <p className="text-muted-foreground mb-4">
                  No custom NIPs have been created for kind {kind} yet.
                </p>
                <Button asChild>
                  <Link to="/create">
                    <FileText className="h-4 w-4 mr-2" />
                    Create a NIP for Kind {kind}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

function KindNipCard({ event }: { event: NostrEvent }) {
  const author = useAuthor(event.pubkey);
  const metadata = author.data?.metadata;
  
  const title = event.tags.find((tag: string[]) => tag[0] === 'title')?.[1] || 'Untitled NIP';
  const dTag = event.tags.find((tag: string[]) => tag[0] === 'd')?.[1] || '';
  const kinds = event.tags.filter((tag: string[]) => tag[0] === 'k').map((tag: string[]) => tag[1]);
  
  const naddr = nip19.naddrEncode({
    identifier: dTag,
    pubkey: event.pubkey,
    kind: event.kind,
  });

  const displayName = metadata?.name ?? genUserName(event.pubkey);

  // Get first few lines of content for preview
  const contentPreview = event.content
    .split('\n')
    .slice(0, 3)
    .join(' ')
    .substring(0, 200) + (event.content.length > 200 ? '...' : '');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-xl">
            <Link to={`/${naddr}`} className="hover:underline">
              {title}
            </Link>
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Custom</Badge>
              {kinds.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-muted-foreground">Kinds:</span>
                  {kinds.slice(0, 3).map(kind => (
                    <Link key={kind} to={`/kind/${kind}`}>
                      <Badge variant="secondary" className="hover:bg-secondary/80 transition-colors cursor-pointer">
                        {kind}
                      </Badge>
                    </Link>
                  ))}
                  {kinds.length > 3 && (
                    <span className="text-sm text-muted-foreground">+{kinds.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              by {displayName}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          {contentPreview}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Created {new Date(event.created_at * 1000).toLocaleDateString()}</span>
          <span>ID: {dTag}</span>
        </div>
      </CardContent>
    </Card>
  );
}