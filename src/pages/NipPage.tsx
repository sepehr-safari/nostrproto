import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useOfficialNip } from '@/hooks/useOfficialNip';
import { useCustomNip } from '@/hooks/useCustomNip';
import { useAuthor } from '@/hooks/useAuthor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Edit, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function NipPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useCurrentUser();
  
  if (!id) {
    return (
      <Layout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid NIP identifier</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  // Check if it's an official NIP (2-digit number) or custom NIP (naddr)
  const isOfficialNip = /^\d{2}$/.test(id);
  
  if (isOfficialNip) {
    return <OfficialNipView nipNumber={id} />;
  } else {
    return <CustomNipView naddr={id} user={user} />;
  }
}

function OfficialNipView({ nipNumber }: { nipNumber: string }) {
  const { data, isLoading, error } = useOfficialNip(nipNumber);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load NIP {nipNumber}. This NIP may not exist.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`https://github.com/nostr-protocol/nips/blob/master/${nipNumber}.md`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on GitHub
            </a>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>NIP-{nipNumber}</CardTitle>
                <Badge variant="secondary">Official</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={data!.content} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomNipView({ naddr, user }: { naddr: string; user: any }) {
  const { data: event, isLoading, error } = useCustomNip(naddr);
  const author = useAuthor(event?.pubkey || '');
  
  const isOwner = user?.pubkey === event?.pubkey;
  
  const title = event?.tags.find(tag => tag[0] === 'title')?.[1] || 'Untitled NIP';
  const dTag = event?.tags.find(tag => tag[0] === 'd')?.[1] || '';
  const kinds = event?.tags.filter(tag => tag[0] === 'k').map(tag => tag[1]) || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load custom NIP. This NIP may not exist or may have been deleted.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          {isOwner && (
            <Button asChild>
              <Link to={`/edit/${naddr}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit NIP
              </Link>
            </Button>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{title}</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline">Custom</Badge>
                  {kinds.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-muted-foreground">Kinds:</span>
                      {kinds.map(kind => (
                        <Badge key={kind} variant="secondary">{kind}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Avatar className="h-8 w-8">
                <AvatarImage src={author.data?.metadata?.picture} />
                <AvatarFallback>
                  {author.data?.metadata?.name?.[0] || event?.pubkey.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {author.data?.metadata?.display_name || author.data?.metadata?.name || `${event?.pubkey.slice(0, 8)}...`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event!.created_at * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={event!.content} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}