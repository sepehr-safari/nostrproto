import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CustomNipCard } from '@/components/CustomNipCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyNips } from '@/hooks/useMyNips';
import { DeleteNipDialog } from '@/components/DeleteNipDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, Edit, AlertCircle, FileText, MoreVertical, Trash2 } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto space-y-6">
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
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const title = event.tags.find((tag: string[]) => tag[0] === 'title')?.[1] || 'Untitled NIP';
  const dTag = event.tags.find((tag: string[]) => tag[0] === 'd')?.[1] || '';
  
  const naddr = nip19.naddrEncode({
    identifier: dTag,
    pubkey: event.pubkey,
    kind: event.kind,
  });

  const actions = (
    <div className="flex items-center space-x-2">
      <Button size="sm" asChild>
        <Link to={`/edit/${naddr}`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
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
  );

  return (
    <>
      <CustomNipCard 
        event={event} 
        maxKinds={3} 
        actions={actions}
        className="hover:shadow-md"
      />

      <DeleteNipDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        event={event}
        title={title}
      />
    </>
  );
}