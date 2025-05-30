import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoginArea } from "@/components/auth/LoginArea";
import { BookOpen, Plus, User, Zap } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary group-hover:text-accent transition-colors duration-300" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-accent/20 transition-colors duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold gradient-text">NIPs on Nostr</span>
              <span className="text-xs text-muted-foreground">Decentralized Protocol Hub</span>
            </div>
          </Link>
          
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
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="relative z-10">
          {children}
        </div>
      </main>
      
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