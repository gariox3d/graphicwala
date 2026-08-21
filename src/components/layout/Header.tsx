import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, MessageCircle, Phone, Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import UserAvatar from '@/components/profile/UserAvatar';
import { WHATSAPP_NUMBER, PHONE_NUMBER, BUSINESS_NAME } from '@/lib/types';
import logoImage from '@/assets/logo.png';
import SearchBar from './SearchBar';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: '🔥 Sale', path: '/sale' },
    { name: 'Help', path: '/ai-assistant' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${BUSINESS_NAME}, I need help with my order.`)}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={logoImage} 
            alt="Graphic Wala Logo" 
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="text-xl font-bold text-foreground">
            Graphic <span className="text-primary">Wala</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <SearchBar />
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden lg:inline">WhatsApp</span>
          </a>
          
          {/* Call Button */}
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden lg:inline">Call</span>
          </a>

          {user ? (
            <>
              <Link to="/wishlist">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" aria-label="My account">
                  {profile?.avatar_url ? (
                    <UserAvatar
                      avatarUrl={profile.avatar_url}
                      name={profile.full_name || user.email}
                      className="h-7 w-7"
                      fallbackClassName="text-[11px]"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="text-muted-foreground font-normal" aria-label="Open admin panel">
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="default">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Search Bar - below header row */}
      <div className="md:hidden container pb-2 animate-fade-in">
        <SearchBar onNavigate={() => setIsMenuOpen(false)} />
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-down">
          <nav className="container py-4 flex flex-col gap-4">
            
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`text-base font-medium py-2 ${
                  isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile WhatsApp & Call */}
            <div className="flex gap-2 pt-2 pb-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white bg-green-500 hover:bg-green-600 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-lg font-medium hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone className="h-5 w-5" />
                Call
              </a>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-2">
                    <UserAvatar avatarUrl={profile?.avatar_url} name={profile?.full_name || user.email} className="h-10 w-10" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{profile?.full_name || 'My Account'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </Link>
                  <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Cart ({cartCount})
                    </Button>
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="h-5 w-5 mr-2" />
                      Wishlist
                    </Button>
                  </Link>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-5 w-5 mr-2" />
                      My Account
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="default" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
