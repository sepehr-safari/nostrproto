import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { DeleteNipDialog } from '@/components/DeleteNipDialog';
import { useOfficialNip } from '@/hooks/useOfficialNip';
import { useCustomNip } from '@/hooks/useCustomNip';
import { useAuthor } from '@/hooks/useAuthor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertCircle, ArrowLeft, Edit, ExternalLink, MoreVertical, Trash2 } from 'lucide-react';
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

  // Check if it's an official NIP (2-character hex string) or custom NIP (naddr)
  const isOfficialNip = /^[0-9A-F]{2}$/i.test(id);
  
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
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
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
              <span className="hidden sm:inline">View on GitHub</span>
              <span className="sm:hidden">GitHub</span>
            </a>
          </Button>
        </div>
        
        <Card className="glass border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="border-b border-primary/10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl sm:text-3xl gradient-text">NIP-{nipNumber}</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Official Protocol</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <MarkdownRenderer content={data!.content} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomNipView({ naddr, user }: { naddr: string; user: any }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
              <Button asChild size="sm" className="sm:size-default">
                <Link to={`/edit/${naddr}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Edit NIP</span>
                  <span className="sm:hidden">Edit</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete NIP
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <Card className="glass border-accent/20 shadow-lg shadow-accent/5">
          <CardHeader className="border-b border-accent/10">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <CardTitle className="text-2xl sm:text-3xl gradient-text break-words">{title}</CardTitle>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Custom Protocol</Badge>
                  {kinds.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="text-sm text-muted-foreground">Kinds:</span>
                      {kinds.map(kind => (
                        <Badge key={kind} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{kind}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 pt-6 border-t border-white/10">
              <Avatar className="h-10 w-10 ring-2 ring-accent/30">
                <AvatarImage src={author.data?.metadata?.picture} />
                <AvatarFallback className="bg-accent/10 text-accent">
                  {author.data?.metadata?.name?.[0] || event?.pubkey.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-accent">
                  {author.data?.metadata?.display_name || author.data?.metadata?.name || `${event?.pubkey.slice(0, 8)}...`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(event!.created_at * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <MarkdownRenderer content={event!.content} />
          </CardContent>
        </Card>

        {isOwner && event && (
          <DeleteNipDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            event={event}
            title={title}
          />
        )}
      </div>
    </Layout>
  );
}