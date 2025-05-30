import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoginArea } from "@/components/auth/LoginArea";
import { BookOpen, Plus, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">NIPs on Nostr</span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/create">
                <Plus className="h-4 w-4 mr-2" />
                Create NIP
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/my-nips">
                <User className="h-4 w-4 mr-2" />
                My NIPs
              </Link>
            </Button>
            <LoginArea />
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}