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
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">NIPs on Nostr</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover official Nostr Implementation Possibilities (NIPs) and publish your own custom NIPs on the Nostr network.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg">
              <Link to="/create">
                <Plus className="h-5 w-5 mr-2" />
                Create Custom NIP
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/my-nips">
                <Users className="h-5 w-5 mr-2" />
                My NIPs
              </Link>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search official NIPs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Official NIPs */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Official NIPs</h2>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredOfficialNips.map((nip) => (
                <Card key={nip.number} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link to={`/nip/${nip.number}`} className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">NIP-{nip.number}</h3>
                          <p className="text-sm text-muted-foreground">{nip.title}</p>
                        </div>
                        <Badge variant="secondary">Official</Badge>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Custom NIPs */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Recent Custom NIPs</h2>
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <Link to={`/nip/${naddr}`} className="block">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{title}</h3>
              <Badge variant="outline">Custom</Badge>
            </div>
            
            {kinds.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-muted-foreground">Kinds:</span>
                {kinds.slice(0, 3).map(kind => (
                  <Badge key={kind} variant="secondary" className="text-xs">{kind}</Badge>
                ))}
                {kinds.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{kinds.length - 3} more</span>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={author.data?.metadata?.picture} />
                <AvatarFallback className="text-xs">
                  {author.data?.metadata?.name?.[0] || event.pubkey.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {author.data?.metadata?.display_name || author.data?.metadata?.name || `${event.pubkey.slice(0, 8)}...`}
              </span>
              <span className="text-xs text-muted-foreground">
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
