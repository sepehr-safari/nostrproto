import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CustomNipCard } from '@/components/CustomNipCard';
import { useRecentCustomNips } from '@/hooks/useRecentCustomNips';
import { useOfficialNips } from '@/hooks/useOfficialNips';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Users, Plus, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: recentNips, isLoading: isLoadingRecent } = useRecentCustomNips();
  const { data: officialNips, isLoading: isLoadingOfficial, error: officialNipsError } = useOfficialNips();

  const filteredOfficialNips = (officialNips || []).filter(
    nip => 
      nip.number.includes(searchTerm) || 
      nip.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 sm:space-y-8 py-8 sm:py-12 px-2">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-4 leading-tight">
              NIPs on Nostr
            </h1>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary via-accent to-primary mx-auto rounded-full"></div>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Discover official <span className="text-primary font-semibold">Nostr Implementation Possibilities</span> and publish your own custom NIPs on the 
              <span className="text-accent font-semibold"> decentralized network</span> of the future.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-4">
            <Button asChild size="lg" className="pulse-glow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border-0 w-full sm:w-auto">
              <Link to="/create">
                <Plus className="h-5 w-5 mr-2" />
                Create Custom NIP
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="glass border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300 w-full sm:w-auto">
              <Link to="/my-nips">
                <Users className="h-5 w-5 mr-2" />
                My NIPs
              </Link>
            </Button>
          </div>

        </div>

        {/* Search */}
        <div className="max-w-lg mx-auto px-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary group-focus-within:text-accent transition-colors" />
            <Input
              placeholder="Search the protocol universe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-2 sm:py-3 glass border-primary/30 focus:border-accent/50 focus:ring-accent/20 text-base sm:text-lg placeholder:text-muted-foreground/60 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Official NIPs */}
          <div className="space-y-4 sm:space-y-6 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text truncate">Official NIPs</h2>
            </div>
            
            <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto mobile-safe">
              {isLoadingOfficial ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : officialNipsError ? (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    <div className="flex items-center justify-center space-x-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Failed to load official NIPs</span>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredOfficialNips.length > 0 ? (
                filteredOfficialNips.map((nip) => (
                  <Card key={nip.number} className="glass border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                    <CardContent className="p-4">
                      <Link to={`/${nip.number}`} className="block">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 flex-1 min-w-0">
                            <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">NIP-{nip.number}</h3>
                            <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">{nip.title}</p>
                            {nip.note && (
                              <p className="text-xs text-muted-foreground/70 italic">{nip.note}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0 ml-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">Official</Badge>
                            {nip.unrecommended && (
                              <Badge variant="destructive" className="text-xs">Unrecommended</Badge>
                            )}
                            {nip.deprecated && (
                              <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">Deprecated</Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    No NIPs found matching your search.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Custom NIPs */}
          <div className="space-y-4 sm:space-y-6 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text truncate">Recent Custom NIPs</h2>
            </div>
            
            <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto mobile-safe">
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



export default Index;