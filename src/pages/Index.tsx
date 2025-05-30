import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useRecentCustomNips } from '@/hooks/useRecentCustomNips';
import { useAuthor } from '@/hooks/useAuthor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Users, Plus } from 'lucide-react';
import { useState } from 'react';
import { nip19 } from 'nostr-tools';
import { NostrEvent } from '@/types/nostr';

// List of official NIPs (commonly referenced ones)
const OFFICIAL_NIPS = [
  { number: '01', title: 'Basic protocol flow description' },
  { number: '02', title: 'Contact List and Petnames' },
  { number: '03', title: 'OpenTimestamps Attestations for Events' },
  { number: '04', title: 'Encrypted Direct Message' },
  { number: '05', title: 'Mapping Nostr keys to DNS-based internet identifiers' },
  { number: '06', title: 'Basic key derivation from mnemonic seed phrase' },
  { number: '07', title: 'window.nostr capability for web browsers' },
  { number: '08', title: 'Handling Mentions' },
  { number: '09', title: 'Event Deletion' },
  { number: '10', title: 'Conventions for clients\' use of e and p tags in text events' },
  { number: '11', title: 'Relay Information Document' },
  { number: '12', title: 'Generic Tag Queries' },
  { number: '13', title: 'Proof of Work' },
  { number: '14', title: 'Subject tag in text events' },
  { number: '15', title: 'Nostr Marketplace (for resilient marketplaces)' },
  { number: '16', title: 'Event Treatment' },
  { number: '18', title: 'Reposts' },
  { number: '19', title: 'bech32-encoded entities' },
  { number: '20', title: 'Command Results' },
  { number: '21', title: 'nostr: URI scheme' },
  { number: '23', title: 'Long-form Content' },
  { number: '25', title: 'Reactions' },
  { number: '26', title: 'Delegated Event Signing' },
  { number: '27', title: 'Text Note References' },
  { number: '28', title: 'Public Chat' },
  { number: '30', title: 'Custom Emoji' },
  { number: '31', title: 'Dealing with Unknown Events' },
  { number: '32', title: 'Labeling' },
  { number: '33', title: 'Parameterized Replaceable Events' },
  { number: '36', title: 'Sensitive Content' },
  { number: '38', title: 'User Statuses' },
  { number: '39', title: 'External Identities in Profiles' },
  { number: '40', title: 'Expiration Timestamp' },
  { number: '42', title: 'Authentication of clients to relays' },
  { number: '44', title: 'Versioned Encryption' },
  { number: '45', title: 'Counting results' },
  { number: '46', title: 'Nostr Connect' },
  { number: '47', title: 'Wallet Connect' },
  { number: '48', title: 'Proxy Tags' },
  { number: '50', title: 'Search Capability' },
  { number: '51', title: 'Lists' },
  { number: '52', title: 'Calendar Events' },
  { number: '53', title: 'Live Activities' },
  { number: '56', title: 'Reporting' },
  { number: '57', title: 'Lightning Zaps' },
  { number: '58', title: 'Badges' },
  { number: '65', title: 'Relay List Metadata' },
  { number: '72', title: 'Moderated Communities' },
  { number: '75', title: 'Zap Goals' },
  { number: '78', title: 'Application-specific data' },
  { number: '84', title: 'Highlights' },
  { number: '89', title: 'Recommended Application Handlers' },
  { number: '90', title: 'Data Vending Machines' },
  { number: '94', title: 'File Metadata' },
  { number: '96', title: 'HTTP File Storage Integration' },
  { number: '98', title: 'HTTP Auth' },
  { number: '99', title: 'Classified Listings' },
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: recentNips, isLoading: isLoadingRecent } = useRecentCustomNips();

  const filteredOfficialNips = OFFICIAL_NIPS.filter(
    nip => 
      nip.number.includes(searchTerm) || 
      nip.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-8 py-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold gradient-text mb-4">
              NIPs on Nostr
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-accent to-primary mx-auto rounded-full"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover official <span className="text-primary font-semibold">Nostr Implementation Possibilities</span> and publish your own custom NIPs on the 
              <span className="text-accent font-semibold"> decentralized network</span> of the future.
            </p>
          </div>
          
          <div className="flex justify-center space-x-6 pt-4">
            <Button asChild size="lg" className="pulse-glow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border-0">
              <Link to="/create">
                <Plus className="h-5 w-5 mr-2" />
                Create Custom NIP
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="glass border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
              <Link to="/my-nips">
                <Users className="h-5 w-5 mr-2" />
                My NIPs
              </Link>
            </Button>
          </div>
          
          {/* Stats or features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            <div className="glass p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Official NIPs</div>
            </div>
            <div className="glass p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-accent mb-2">∞</div>
              <div className="text-sm text-muted-foreground">Decentralized</div>
            </div>
            <div className="glass p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Always Online</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-lg mx-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary group-focus-within:text-accent transition-colors" />
            <Input
              placeholder="Search the protocol universe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 glass border-primary/30 focus:border-accent/50 focus:ring-accent/20 text-lg placeholder:text-muted-foreground/60 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Official NIPs */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold gradient-text">Official NIPs</h2>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredOfficialNips.map((nip) => (
                <Card key={nip.number} className="glass border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                  <CardContent className="p-4">
                    <Link to={`/nip/${nip.number}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">NIP-{nip.number}</h3>
                          <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">{nip.title}</p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Official</Badge>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Custom NIPs */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-3xl font-bold gradient-text">Recent Custom NIPs</h2>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoadingRecent ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : recentNips && recentNips.length > 0 ? (
                recentNips.map((event) => (
                  <CustomNipCard key={event.id} event={event} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    No custom NIPs found. Be the first to create one!
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

function CustomNipCard({ event }: { event: NostrEvent }) {
  const author = useAuthor(event.pubkey);
  const title = event.tags.find((tag: string[]) => tag[0] === 'title')?.[1] || 'Untitled NIP';
  const kinds = event.tags.filter((tag: string[]) => tag[0] === 'k').map((tag: string[]) => tag[1]);
  const dTag = event.tags.find((tag: string[]) => tag[0] === 'd')?.[1] || '';
  
  const naddr = nip19.naddrEncode({
    identifier: dTag,
    pubkey: event.pubkey,
    kind: event.kind,
  });

  return (
    <Card className="glass border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 group">
      <CardContent className="p-4">
        <Link to={`/nip/${naddr}`} className="block">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold truncate text-accent group-hover:text-primary transition-colors">{title}</h3>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Custom</Badge>
            </div>
            
            {kinds.length > 0 && (
              <div className="flex items-center space-x-1 flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">Kinds:</span>
                {kinds.slice(0, 3).map(kind => (
                  <Badge key={kind} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{kind}</Badge>
                ))}
                {kinds.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{kinds.length - 3} more</span>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 ring-2 ring-accent/20">
                <AvatarImage src={author.data?.metadata?.picture} />
                <AvatarFallback className="text-xs bg-accent/10 text-accent">
                  {author.data?.metadata?.name?.[0] || event.pubkey.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                {author.data?.metadata?.display_name || author.data?.metadata?.name || `${event.pubkey.slice(0, 8)}...`}
              </span>
              <span className="text-xs text-muted-foreground/60">
                {new Date(event.created_at * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

export default Index;
