import { useParams, Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Layout } from '@/components/Layout';
import { CustomNipCard } from '@/components/CustomNipCard';
import { useAuthor } from '@/hooks/useAuthor';
import { useCustomNipsByAuthor } from '@/hooks/useCustomNipsByAuthor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, ExternalLink, MapPin, Globe, Zap } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import NotFound from './NotFound';

export default function AuthorPage() {
  const { nip19: nip19Param } = useParams<{ nip19: string }>();
  
  if (!nip19Param) {
    return <NotFound />;
  }

  // Try to decode as nip19
  try {
    const decoded = nip19.decode(nip19Param);
    
    if (decoded.type === 'npub') {
      return <AuthorView pubkey={decoded.data} />;
    } else if (decoded.type === 'nprofile') {
      return <AuthorView pubkey={decoded.data.pubkey} />;
    } else {
      // Not a supported author identifier
      return <NotFound />;
    }
  } catch {
    // Not a valid nip19 identifier
    return <NotFound />;
  }
}

function AuthorView({ pubkey }: { pubkey: string }) {
  const author = useAuthor(pubkey);
  const { data: customNips, isLoading: nipsLoading, error: nipsError } = useCustomNipsByAuthor(pubkey);
  
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const userName = metadata?.name || genUserName(pubkey);
  const about = metadata?.about;
  const website = metadata?.website;
  const nip05 = metadata?.nip05;
  const lud16 = metadata?.lud16;
  const profileImage = metadata?.picture;
  const bannerImage = metadata?.banner;

  if (author.isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        
        {/* Author Profile Card */}
        <Card className="glass border-primary/20 shadow-lg shadow-primary/5">
          {bannerImage && (
            <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-accent/20 rounded-t-lg overflow-hidden">
              <img 
                src={bannerImage} 
                alt="Profile banner" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader className={bannerImage ? "-mt-16 relative z-10" : ""}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-background shadow-lg">
                <AvatarImage src={profileImage} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {displayName[0]?.toUpperCase() || pubkey.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl gradient-text">
                    {displayName}
                  </CardTitle>
                  {userName !== displayName && (
                    <p className="text-muted-foreground">@{userName}</p>
                  )}
                </div>
                
                {about && (
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {about}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {website && (
                    <a 
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="hidden sm:inline">Website</span>
                    </a>
                  )}
                  
                  {nip05 && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{nip05}</span>
                      <Badge variant="secondary" className="text-xs">
                        NIP-05
                      </Badge>
                    </div>
                  )}
                  
                  {lud16 && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{lud16}</span>
                      <Badge variant="secondary" className="text-xs">
                        Lightning
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    NIP Author
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://njump.me/${nip19.npubEncode(pubkey)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Profile
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Custom NIPs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold gradient-text">
              Custom NIPs
            </h2>
            {customNips && customNips.length > 0 && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {customNips.length} NIP{customNips.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {nipsLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          )}

          {nipsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load Custom NIPs for this author.
              </AlertDescription>
            </Alert>
          )}

          {customNips && customNips.length === 0 && (
            <Card className="glass border-muted/20">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  This author hasn't published any Custom NIPs yet.
                </p>
              </CardContent>
            </Card>
          )}

          {customNips && customNips.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customNips.map((event) => (
                <CustomNipCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}