import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyNips } from '@/hooks/useMyNips';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Edit, AlertCircle, FileText } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { NostrEvent } from '@/types/nostr';

export default function MyNipsPage() {
  const { user } = useCurrentUser();
  const { data: myNips, isLoading, error } = useMyNips();

  if (!user) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to view your NIPs.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button asChild>
            <Link to="/create">
              <Plus className="h-4 w-4 mr-2" />
              Create New NIP
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-3xl font-bold">My NIPs</h1>
          </div>

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
                Failed to load your NIPs. Please try again.
              </AlertDescription>
            </Alert>
          ) : myNips && myNips.length > 0 ? (
            <div className="space-y-4">
              {myNips.map((event) => (
                <MyNipCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No NIPs yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any custom NIPs yet. Create your first one to get started!
                </p>
                <Button asChild>
                  <Link to="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First NIP
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

function MyNipCard({ event }: { event: NostrEvent }) {
  const title = event.tags.find((tag: string[]) => tag[0] === 'title')?.[1] || 'Untitled NIP';
  const dTag = event.tags.find((tag: string[]) => tag[0] === 'd')?.[1] || '';
  const kinds = event.tags.filter((tag: string[]) => tag[0] === 'k').map((tag: string[]) => tag[1]);
  
  const naddr = nip19.naddrEncode({
    identifier: dTag,
    pubkey: event.pubkey,
    kind: event.kind,
  });

  // Get first few lines of content for preview
  const contentPreview = event.content
    .split('\n')
    .slice(0, 3)
    .join(' ')
    .substring(0, 200) + (event.content.length > 200 ? '...' : '');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl">
              <Link to={`/nip/${naddr}`} className="hover:underline">
                {title}
              </Link>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Custom</Badge>
              {kinds.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-muted-foreground">Kinds:</span>
                  {kinds.slice(0, 3).map(kind => (
                    <Badge key={kind} variant="secondary">{kind}</Badge>
                  ))}
                  {kinds.length > 3 && (
                    <span className="text-sm text-muted-foreground">+{kinds.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <Button size="sm" asChild>
            <Link to={`/edit/${naddr}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
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