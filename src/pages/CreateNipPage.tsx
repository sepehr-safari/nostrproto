import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { KindInput } from '@/components/KindInput';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ArrowLeft, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { nip19 } from 'nostr-tools';
import { slugify } from '@/lib/utils';

export default function CreateNipPage() {
  const { user } = useCurrentUser();
  const { mutate: publishEvent, isPending } = useNostrPublish();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [content, setContent] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [identifierManuallyEdited, setIdentifierManuallyEdited] = useState(false);

  // Auto-generate identifier from title
  useEffect(() => {
    if (!identifierManuallyEdited && title) {
      setIdentifier(slugify(title));
    }
  }, [title, identifierManuallyEdited]);

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
            <CardTitle>Create Custom NIP</CardTitle>
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