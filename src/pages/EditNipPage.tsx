import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCustomNip } from '@/hooks/useCustomNip';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ArrowLeft, Plus, X, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { nip19 } from 'nostr-tools';

export default function EditNipPage() {
  const { naddr } = useParams<{ naddr: string }>();
  const { user } = useCurrentUser();
  const { data: event, isLoading, error } = useCustomNip(naddr!);
  const { mutate: publishEvent, isPending } = useNostrPublish();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [content, setContent] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [newKind, setNewKind] = useState('');

  useEffect(() => {
    if (event) {
      const titleTag = event.tags.find(tag => tag[0] === 'title')?.[1] || '';
      const dTag = event.tags.find(tag => tag[0] === 'd')?.[1] || '';
      const kindTags = event.tags.filter(tag => tag[0] === 'k').map(tag => tag[1]);
      
      setTitle(titleTag);
      setIdentifier(dTag);
      setContent(event.content);
      setKinds(kindTags);
    }
  }, [event]);

  if (!naddr) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid NIP identifier</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to={`/nip/${naddr}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to NIP
            </Link>
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to edit a NIP.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Button variant="ghost" asChild>
            <Link to={`/nip/${naddr}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to NIP
            </Link>
          </Button>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to={`/nip/${naddr}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to NIP
            </Link>
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load NIP for editing.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (user.pubkey !== event.pubkey) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to={`/nip/${naddr}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to NIP
            </Link>
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can only edit your own NIPs.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const addKind = () => {
    const trimmedKind = newKind.trim();
    
    // Validate that it's a number
    if (!trimmedKind) return;
    
    const kindNumber = parseInt(trimmedKind, 10);
    if (isNaN(kindNumber) || kindNumber < 0 || !Number.isInteger(Number(trimmedKind))) {
      toast.error('Event kind must be a valid non-negative integer');
      return;
    }
    
    const kindString = kindNumber.toString();
    if (!kinds.includes(kindString)) {
      setKinds([...kinds, kindString]);
      setNewKind('');
    } else {
      toast.error('This event kind is already added');
    }
  };

  const removeKind = (kindToRemove: string) => {
    setKinds(kinds.filter(k => k !== kindToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !identifier.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const tags = [
      ['d', identifier.trim()],
      ['title', title.trim()],
      ...kinds.map(kind => ['k', kind]),
    ];

    publishEvent(
      {
        kind: 30817,
        content: content.trim(),
        tags,
      },
      {
        onSuccess: (newEvent) => {
          const newNaddr = nip19.naddrEncode({
            identifier: identifier.trim(),
            pubkey: newEvent.pubkey,
            kind: newEvent.kind,
          });
          toast.success('NIP updated successfully!');
          navigate(`/nip/${newNaddr}`);
        },
        onError: (error) => {
          toast.error('Failed to update NIP: ' + error.message);
        },
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to={`/nip/${naddr}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to NIP
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit NIP</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Custom Event Kind for XYZ"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="identifier">Identifier *</Label>
                  <Input
                    id="identifier"
                    value={identifier}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    The identifier cannot be changed. To use a different identifier, delete this NIP and create a new one.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Event Kinds (optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newKind}
                    onChange={(e) => setNewKind(e.target.value)}
                    placeholder="e.g., 30000"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab' || e.key === ' ') {
                        e.preventDefault();
                        addKind();
                      }
                    }}
                  />
                  <Button type="button" onClick={addKind} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {kinds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {kinds.map(kind => (
                      <Badge key={kind} variant="secondary" className="flex items-center space-x-1">
                        <span>{kind}</span>
                        <button
                          type="button"
                          onClick={() => removeKind(kind)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Add event kinds that this NIP defines or relates to. Press Enter, comma, Tab, or space to add. Must be valid numbers.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Tabs defaultValue="write" className="w-full">
                  <TabsList>
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write">
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your NIP content in Markdown..."
                      className="min-h-[400px] font-mono"
                      required
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="border rounded-md p-4 min-h-[400px] bg-muted/50">
                      {content ? (
                        <MarkdownRenderer content={content} />
                      ) : (
                        <p className="text-muted-foreground">Nothing to preview yet...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                <p className="text-xs text-muted-foreground">
                  Use Markdown formatting. This will be the main content of your NIP.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/nip/${naddr}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>Updating...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update NIP
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}