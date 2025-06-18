
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, Settings, LogOut, Crown, Calendar, Menu } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, signOut, isProUser, subscriptionExpiry, userRole } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const daysUntilExpiry = subscriptionExpiry 
    ? Math.ceil((subscriptionExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const showExpiryWarning = daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">GS</span>
            </div>
            <div className="flex flex-col">
              <div className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform">
                GeneSYNC
              </div>
              <div className="text-xs text-muted-foreground -mt-1">
                Translator
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/quiz" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:scale-105 transform"
            >
              JLPT Quiz
            </Link>
            <Link 
              to="/phrasebook" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:scale-105 transform"
            >
              Phrasebook
            </Link>
            <Link 
              to="/history" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:scale-105 transform"
            >
              Riwayat
            </Link>
            {!isProUser && (
              <Link 
                to="/upgrade" 
                className="flex items-center space-x-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors hover:scale-105 transform"
              >
                <Crown size={16} />
                <span>Upgrade Pro</span>
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Subscription expiry warning */}
            {showExpiryWarning && (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium premium-border animate-pulse">
                <Calendar size={12} />
                <span>Pro berakhir {daysUntilExpiry} hari</span>
              </div>
            )}

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-full hover:bg-accent/10 focus-premium"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden w-9 h-9 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={16} />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full focus-premium">
                  <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 glass-card" align="end" forceMount>
                <div className="flex flex-col space-y-2 p-3">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={isProUser ? "default" : "secondary"}
                      className={isProUser 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }
                    >
                      {isProUser ? '✨ PRO' : 'FREE'}
                    </Badge>
                    {subscriptionExpiry && isProUser && (
                      <span className="text-xs text-muted-foreground">
                        {subscriptionExpiry.toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center focus-premium">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Pengaturan</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 glass-card rounded-2xl animate-fade-in-up">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/quiz" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                JLPT Quiz
              </Link>
              <Link 
                to="/phrasebook" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Phrasebook
              </Link>
              <Link 
                to="/history" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Riwayat
              </Link>
              {!isProUser && (
                <Link 
                  to="/upgrade" 
                  className="flex items-center space-x-2 text-sm font-medium text-amber-600 dark:text-amber-400 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Crown size={16} />
                  <span>Upgrade Pro</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
