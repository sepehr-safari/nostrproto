import { useState } from 'react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Layout } from '@/components/Layout';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { DeleteNipDialog } from '@/components/DeleteNipDialog';
import { CommentsSection } from '@/components/CommentsSection';
import { LikeButton } from '@/components/LikeButton';
import { EventSourceDialog } from '@/components/EventSourceDialog';
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
import { AlertCircle, ArrowLeft, Edit, ExternalLink, MoreVertical, Trash2, Code } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface NipPageProps {
  nipId: string;
  isOfficialNip: boolean;
}

export default function NipPage({ nipId, isOfficialNip }: NipPageProps) {
  const { user } = useCurrentUser();
  
  if (!nipId) {
    return (
      <Layout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid NIP identifier</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  if (isOfficialNip) {
    return <OfficialNipView nipNumber={nipId} />;
  } else {
    return <CustomNipView naddr={nipId} user={user} />;
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
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const { data: event, isLoading, error } = useCustomNip(naddr);
  const author = useAuthor(event?.pubkey || '');
  
  const isOwner = user?.pubkey === event?.pubkey;
  
  const title = event?.tags.find(tag => tag[0] === 'title')?.[1] || 'Untitled NIP';

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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
            {isOwner && (
              <Button asChild size="sm" className="sm:size-default">
                <Link to={`/edit/${naddr}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Edit NIP</span>
                  <span className="sm:hidden">Edit</span>
                </Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSourceDialog(true)}>
                  <Code className="h-4 w-4 mr-2" />
                  View Source
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete NIP
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Card className="glass border-accent/20 shadow-lg shadow-accent/5">
          <CardHeader className="border-b border-accent/10">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <CardTitle className="text-2xl sm:text-3xl gradient-text break-words">{title}</CardTitle>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Custom Protocol</Badge>
                  {kinds.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="text-sm text-muted-foreground">Kinds:</span>
                      {kinds.map(kind => (
                        <Link key={kind} to={`/kind/${kind}`}>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                            {kind}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <LikeButton event={event!} naddr={naddr} />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 pt-6 border-t border-white/10">
              <Link to={`/${nip19.npubEncode(event!.pubkey)}`}>
                <Avatar className="h-10 w-10 ring-2 ring-accent/30 hover:ring-primary/40 transition-all cursor-pointer">
                  <AvatarImage src={author.data?.metadata?.picture} />
                  <AvatarFallback className="bg-accent/10 text-accent">
                    {author.data?.metadata?.name?.[0] || event?.pubkey.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link 
                  to={`/${nip19.npubEncode(event!.pubkey)}`}
                  className="font-medium text-accent hover:text-primary transition-colors"
                >
                  {author.data?.metadata?.display_name || author.data?.metadata?.name || `${event?.pubkey.slice(0, 8)}...`}
                </Link>
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

        {/* Comments Section */}
        <CommentsSection naddr={naddr} />

        {isOwner && event && (
          <DeleteNipDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            event={event}
            title={title}
          />
        )}

        {/* View Source Dialog */}
        {event && (
          <EventSourceDialog
            event={event}
            open={showSourceDialog}
            onOpenChange={setShowSourceDialog}
          />
        )}
      </div>
    </Layout>
  );
}