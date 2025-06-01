import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { KindInput } from '@/components/KindInput';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCustomNip } from '@/hooks/useCustomNip';
import { useOfficialNip } from '@/hooks/useOfficialNip';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ArrowLeft, AlertCircle, Save, GitFork, X } from 'lucide-react';
import { toast } from 'sonner';
import { nip19 } from 'nostr-tools';
import { slugify } from '@/lib/utils';

export default function CreateNipPage() {
  const { user } = useCurrentUser();
  const { mutate: publishEvent, isPending } = useNostrPublish();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [title, setTitle] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [content, setContent] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [identifierManuallyEdited, setIdentifierManuallyEdited] = useState(false);
  const [forkSource, setForkSource] = useState<string | null>(null);
  const [forkSourceType, setForkSourceType] = useState<'custom' | 'official' | null>(null);

  // Get fork parameters from URL
  const forkParam = searchParams.get('fork');
  const forkTypeParam = searchParams.get('forkType') as 'custom' | 'official' | null;

  // Load fork source data
  const { data: customForkSource } = useCustomNip(forkParam && forkTypeParam === 'custom' ? forkParam : '');
  const { data: officialForkSource } = useOfficialNip(forkParam && forkTypeParam === 'official' ? forkParam : '');

  // Auto-generate identifier from title
  useEffect(() => {
    if (!identifierManuallyEdited && title) {
      setIdentifier(slugify(title));
    }
  }, [title, identifierManuallyEdited]);

  // Initialize fork source when URL params change
  useEffect(() => {
    if (forkParam && forkTypeParam) {
      setForkSource(forkParam);
      setForkSourceType(forkTypeParam);
    }
  }, [forkParam, forkTypeParam]);

  // Pre-fill form when forking
  useEffect(() => {
    if (forkSource && forkSourceType) {
      if (forkSourceType === 'custom' && customForkSource) {
        const titleTag = customForkSource.tags.find(tag => tag[0] === 'title')?.[1] || '';
        const kindTags = customForkSource.tags.filter(tag => tag[0] === 'k').map(tag => tag[1]);
        
        setTitle(titleTag);
        setContent(customForkSource.content);
        setKinds(kindTags);
        setIdentifierManuallyEdited(false); // Allow auto-generation for fork
      } else if (forkSourceType === 'official' && officialForkSource) {
        setTitle(`NIP-${forkSource}`);
        setContent(officialForkSource.content);
        setKinds([]);
        setIdentifierManuallyEdited(false); // Allow auto-generation for fork
      }
    }
  }, [forkSource, forkSourceType, customForkSource, officialForkSource]);

  if (!user) {
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
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to create a custom NIP.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }



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

    // Add fork tag if this is a fork
    if (forkSource && forkSourceType) {
      if (forkSourceType === 'custom' && customForkSource) {
        // For custom NIPs, use kind:pubkey:d format
        tags.push(['fork', `${customForkSource.kind}:${customForkSource.pubkey}:${customForkSource.tags.find(tag => tag[0] === 'd')?.[1] || ''}`]);
      } else if (forkSourceType === 'official') {
        // For official NIPs, use a special format
        tags.push(['fork', `official:${forkSource}`]);
      }
    }

    publishEvent(
      {
        kind: 30817,
        content: content.trim(),
        tags,
      },
      {
        onSuccess: (event) => {
          const naddr = nip19.naddrEncode({
            identifier: identifier.trim(),
            pubkey: event.pubkey,
            kind: event.kind,
          });
          toast.success('NIP published successfully!');
          navigate(`/${naddr}`);
        },
        onError: (error) => {
          toast.error('Failed to publish NIP: ' + error.message);
        },
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {forkSource && <GitFork className="h-5 w-5" />}
              {forkSource ? 'Fork Custom NIP' : 'Create Custom NIP'}
            </CardTitle>
            {forkSource && forkSourceType && (
              <Alert className="mt-4">
                <GitFork className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Forking from {forkSourceType === 'official' ? `NIP-${forkSource}` : 'custom NIP'}
                    {forkSourceType === 'custom' && customForkSource && (
                      <span className="ml-1">
                        "{customForkSource.tags.find(tag => tag[0] === 'title')?.[1] || 'Untitled'}"
                      </span>
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setForkSource(null);
                      setForkSourceType(null);
                      // Clear the URL params
                      const newUrl = new URL(window.location.href);
                      newUrl.searchParams.delete('fork');
                      newUrl.searchParams.delete('forkType');
                      window.history.replaceState({}, '', newUrl.toString());
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
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
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setIdentifierManuallyEdited(true);
                    }}
                    placeholder="e.g., custom-xyz-events"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier for this NIP (used in the naddr). Auto-generated from title, but you can edit it.
                  </p>
                </div>
              </div>

              <KindInput
                kinds={kinds}
                onKindsChange={setKinds}
              />

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
                      className="min-h-[300px] sm:min-h-[400px] font-mono text-sm"
                      required
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="border rounded-md p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] bg-muted/50 overflow-auto">
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

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
                <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                  <Link to="/">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? (
                    <>Publishing...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Publish NIP
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