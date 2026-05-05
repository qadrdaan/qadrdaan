import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ChevronDown, LogOut, User, Settings, Home } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import NotificationBell from "@/components/NotificationBell";
import SearchBar from "@/components/SearchBar";
import Logo from "@/components/Logo";

const mainLinks: { href: string; label: string; icon?: any }[] = [
  { href: "/poetry", label: "Home", icon: Home },
  { href: "/shorts", label: "Shorts" },
  { href: "/books", label: "Books" },
  { href: "/videos", label: "Videos" },
  { href: "/poets", label: "Poets" },
];

const moreLinks = [
  { href: "/mushairas", label: "Mushairas" },
  { href: "/competitions", label: "Competitions" },
  { href: "/challenges", label: "Challenges" },
  { href: "/video-rooms", label: "Video Rooms" },
  { href: "/fan-clubs", label: "Fan Clubs" },
  { href: "/gift-shop", label: "Gift Shop" },
  { href: "/gift-leaderboard", label: "Leaderboard" },
  { href: "/leaderboard", label: "Creator Rankings" },
  { href: "/bookmarks", label: "Bookmarks" },
];

const creatorLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/wallet", label: "Wallet" },
  { href: "/ads", label: "Ads Manager" },
  { href: "/referrals", label: "Referrals" },
  { href: "/verification", label: "Verification" },
  { href: "/creator-hub", label: "Creator Hub" },
];

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6 font-body text-sm text-foreground/80">
          {mainLinks.map((l) => (
            <Link key={l.href} to={l.href} className="hover:text-primary transition-colors whitespace-nowrap font-medium flex items-center gap-1.5" title={l.label}>
              {l.icon ? <l.icon className="w-4 h-4" /> : null}
              {l.icon ? <span className="sr-only">{l.label}</span> : l.label}
            </Link>
          ))}

          <div className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
            <button className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
              More <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-2 z-50">
                  {moreLinks.map((l) => (
                    <Link key={l.href} to={l.href} className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">{l.label}</Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user && (
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
                Creator <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-xl py-2 z-50 hidden group-hover:block">
                {creatorLinks.map((l) => (
                  <Link key={l.href} to={l.href} className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SearchBar />
          {user && <NotificationBell />}

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={avatarRef}>
                <button onClick={() => setAvatarOpen(!avatarOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors">
                  <span className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-primary-foreground overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.display_name || user.email || "?")[0].toUpperCase()
                    )}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-display text-sm font-bold text-foreground truncate">{profile?.display_name || "User"}</p>
                        <p className="font-body text-[11px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors font-body">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/settings" onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors font-body">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button onClick={() => { setAvatarOpen(false); handleSignOut(); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors font-body w-full text-left">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/auth" className="px-3 py-2 text-sm font-body font-medium text-foreground/90 hover:text-primary transition-colors">Sign In</Link>
                <Link to="/auth" className="px-5 py-2 text-sm font-body font-bold bg-primary text-primary-foreground rounded-full shadow-brand hover:opacity-90 transition-all hover:scale-105">Join Free</Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-foreground/80 hover:text-primary transition-colors" aria-label="Toggle menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-card border-t border-border max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto px-6 py-4 flex flex-col gap-1 font-body text-sm">
              {[...mainLinks, ...moreLinks].map((l) => (
                <Link key={l.href} to={l.href} onClick={() => setOpen(false)}
                  className="py-3 px-3 rounded-lg text-foreground/80 hover:text-primary hover:bg-muted transition-colors font-medium">{l.label}</Link>
              ))}
              {user && (
                <>
                  <div className="my-2 border-t border-border" />
                  <p className="px-3 py-1 text-xs text-primary font-bold uppercase tracking-wider">Creator</p>
                  {creatorLinks.map((l) => (
                    <Link key={l.href} to={l.href} onClick={() => setOpen(false)}
                      className="py-3 px-3 rounded-lg text-foreground/80 hover:text-primary hover:bg-muted transition-colors font-medium">{l.label}</Link>
                  ))}
                </>
              )}
              <div className="my-2 border-t border-border" />
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg text-foreground/90 hover:text-primary hover:bg-muted transition-colors font-medium">
                    <span className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {(profile?.display_name || user.email || "?")[0].toUpperCase()}
                    </span>
                    {profile?.display_name || "Profile"}
                  </Link>
                  <Link to="/settings" onClick={() => setOpen(false)}
                    className="py-3 px-3 rounded-lg text-foreground/80 hover:text-primary hover:bg-muted transition-colors font-medium">Settings</Link>
                  <button onClick={() => { setOpen(false); handleSignOut(); }}
                    className="py-3 px-3 rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setOpen(false)} className="py-3 px-3 rounded-lg text-foreground/90 hover:text-primary hover:bg-muted transition-colors font-medium">Sign In</Link>
                  <Link to="/auth" onClick={() => setOpen(false)} className="mt-2 py-3 text-center font-bold bg-primary text-primary-foreground rounded-xl shadow-brand hover:opacity-90 transition-opacity">Join Free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
