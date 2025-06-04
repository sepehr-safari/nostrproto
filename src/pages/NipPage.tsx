import { CommentsSection } from '@/components/CommentsSection';
import { DeleteNipDialog } from '@/components/DeleteNipDialog';
import { EventSourceDialog } from '@/components/EventSourceDialog';
import { Layout } from '@/components/Layout';
import { LikeButton } from '@/components/LikeButton';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { OfficialNipCommentsSection } from '@/components/OfficialNipCommentsSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCustomNip } from '@/hooks/useCustomNip';
import { useOfficialNip } from '@/hooks/useOfficialNip';
import {
  AlertCircle,
  ArrowLeft,
  Code,
  Edit,
  ExternalLink,
  GitFork,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface NipPageProps {
  nipId: string;
  isOfficialNip: boolean;
}

interface User {
  pubkey: string;
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
    return <CustomNipView naddr={nipId} user={user ?? null} />;
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
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/create?officialFork=${nipNumber}`}>
                <GitFork className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Fork NIP</span>
                <span className="sm:hidden">Fork</span>
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
        </div>

        <Card className="glass border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="border-b border-primary/10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl sm:text-3xl gradient-text">
                  NIP-{nipNumber}
                </CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Official Protocol
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <MarkdownRenderer content={data!.content} />
          </CardContent>
        </Card>

        {/* Comments Section */}
        <OfficialNipCommentsSection nipNumber={nipNumber} />
      </div>
    </Layout>
  );
}

function ForkInfo({ forkATag }: { forkATag: string }) {
  const { data: forkSourceEvent } = useCustomNip(
    (() => {
      try {
        const [kind, pubkey, identifier] = forkATag.split(':');
        return nip19.naddrEncode({
          kind: parseInt(kind),
          pubkey,
          identifier,
        });
      } catch {
        return '';
      }
    })()
  );

  if (forkSourceEvent) {
    const sourceTitle =
      forkSourceEvent.tags.find((tag) => tag[0] === 'title')?.[1] || 'Untitled NIP';
    const [kind, pubkey, identifier] = forkATag.split(':');
    const sourceNaddr = nip19.naddrEncode({
      kind: parseInt(kind),
      pubkey,
      identifier,
    });

    return (
      <div className="pt-6 !mt-5 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GitFork className="h-4 w-4" />
          <span>Fork of</span>
          <Link
            to={`/${sourceNaddr}`}
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {sourceTitle}
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

function OfficialForkInfo({ forkITag }: { forkITag: string }) {
  // Extract NIP number from GitHub URL
  const nipNumber = forkITag.match(/\/(\d+)\.md$/)?.[1];

  if (nipNumber) {
    return (
      <div className="pt-6 !mt-5 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GitFork className="h-4 w-4" />
          <span>Fork of</span>
          <Link
            to={`/nip/${nipNumber}`}
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            NIP-{nipNumber}
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

function CustomNipView({ naddr, user }: { naddr: string; user: User | null }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const { data: event, isLoading, error } = useCustomNip(naddr);
  const author = useAuthor(event?.pubkey || '');

  const isOwner = user?.pubkey === event?.pubkey;

  const title = event?.tags.find((tag) => tag[0] === 'title')?.[1] || 'Untitled NIP';

  const kinds = event?.tags.filter((tag) => tag[0] === 'k').map((tag) => tag[1]) || [];

  const forkATag = event?.tags.find((tag) => tag[0] === 'a' && tag[3] === 'fork')?.[1];
  const forkITag = event?.tags.find((tag) => tag[0] === 'i' && tag[2] === 'fork')?.[1];
  const isForked = !!(forkATag || forkITag);

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
          <div className="flex items-stretch sm:items-center gap-2 sm:space-x-2">
            {isOwner ? (
              <Button asChild size="sm" className="sm:size-default">
                <Link to={`/edit/${naddr}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Edit NIP</span>
                  <span className="sm:hidden">Edit</span>
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild size="sm" className="sm:size-default">
                <Link to={`/create?fork=${naddr}`}>
                  <GitFork className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Fork NIP</span>
                  <span className="sm:hidden">Fork</span>
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
                <CardTitle className="text-2xl sm:text-3xl gradient-text break-words">
                  {title}
                </CardTitle>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    Custom Protocol
                  </Badge>
                  {isForked && (
                    <Badge
                      variant="outline"
                      className="bg-orange-500/10 text-orange-500 border-orange-500/20"
                    >
                      <GitFork className="h-3 w-3 mr-1" />
                      Fork
                    </Badge>
                  )}
                  {kinds.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="text-sm text-muted-foreground">Kinds:</span>
                      {kinds.map((kind) => (
                        <Link key={kind} to={`/kind/${kind}`}>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                          >
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
                  {author.data?.metadata?.display_name ||
                    author.data?.metadata?.name ||
                    `${event?.pubkey.slice(0, 8)}...`}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(event!.created_at * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Fork Information */}
            {isForked && forkATag && <ForkInfo forkATag={forkATag} />}
            {isForked && forkITag && <OfficialForkInfo forkITag={forkITag} />}
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
