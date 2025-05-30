import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoginArea } from "@/components/auth/LoginArea";
import { Footer } from "@/components/Footer";
import { BookOpen, Plus, User, Zap, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background cyber-grid flex flex-col">
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
            <div className="relative">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-accent transition-colors duration-300" />
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl group-hover:bg-primary/20 transition-colors duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold gradient-text">NIPs on Nostr</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Decentralized Protocol Hub</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <Link to="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create NIP
                </Link>
              </Button>
              <Button variant="ghost" asChild className="text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <Link to="/my-nips">
                  <User className="h-4 w-4 mr-2" />
                  My NIPs
                </Link>
              </Button>
              <div className="ml-4">
                <LoginArea />
              </div>
            </nav>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <LoginArea />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[400px] glass border-primary/20">
                  <SheetHeader>
                    <SheetTitle className="gradient-text">Navigation</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-4 mt-6">
                    <Button variant="ghost" asChild className="justify-start text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                      <Link to="/create">
                        <Plus className="h-4 w-4 mr-3" />
                        Create NIP
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                      <Link to="/my-nips">
                        <User className="h-4 w-4 mr-3" />
                        My NIPs
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                      <Link to="/">
                        <BookOpen className="h-4 w-4 mr-3" />
                        Browse NIPs
                      </Link>
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-4 sm:py-8 relative overflow-x-hidden flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative z-10 min-w-0">
          {children}
        </div>
      </main>
      
      <Footer />
      
      {/* Floating particles effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full float"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent/40 rounded-full float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary/20 rounded-full float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/30 rounded-full float" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}