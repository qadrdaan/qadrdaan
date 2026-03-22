import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import NotificationBell from "@/components/NotificationBell";
import SearchBar from "@/components/SearchBar";
import Logo from "@/components/Logo";

const mainLinks = [
  { href: "/poetry", label: "Poetry" },
  { href: "/books", label: "Books" },
  { href: "/videos", label: "Videos" },
  { href: "/poets", label: "Poets" },
  { href: "/discover", label: "Discover" },
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
];

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

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
            <a key={l.href} href={l.href} className="hover:text-primary transition-colors whitespace-nowrap font-medium">
              {l.label}
            </a>
          ))}

          {/* More dropdown */}
          <div className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
            <button className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
              More <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-2 z-50"
                >
                  {moreLinks.map((l) => (
                    <a key={l.href} href={l.href} className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                      {l.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Creator dropdown (logged in only) */}
          {user && (
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
                Creator <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-xl py-2 z-50 hidden group-hover:block">
                {creatorLinks.map((l) => (
                  <a key={l.href} href={l.href} className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    {l.label}
                  </a>
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
              <>
                <a href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-body text-foreground/90 hover:text-primary transition-colors">
                  <span className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                    {(profile?.display_name || user.email || "?")[0].toUpperCase()}
                  </span>
                  <span className="hidden xl:inline font-medium">{profile?.display_name || "Profile"}</span>
                </a>
                <button onClick={handleSignOut} className="px-3 py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a href="/auth" className="px-3 py-2 text-sm font-body font-medium text-foreground/90 hover:text-primary transition-colors">
                  Sign In
                </a>
                <a href="/auth" className="px-5 py-2 text-sm font-body font-bold bg-primary text-white rounded-full shadow-brand hover:opacity-90 transition-all hover:scale-105">
                  Join Free
                </a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
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
                <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="py-3 px-3 rounded-lg text-foreground/80 hover:text-primary hover:bg-muted transition-colors font-medium">
                  {l.label}
                </a>
              ))}
              {user && (
                <>
                  <div className="my-2 border-t border-border" />
                  <p className="px-3 py-1 text-xs text-primary font-bold uppercase tracking-wider">Creator</p>
                  {creatorLinks.map((l) => (
                    <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                      className="py-3 px-3 rounded-lg text-foreground/80 hover:text-primary hover:bg-muted transition-colors font-medium">
                      {l.label}
                    </a>
                  ))}
                </>
              )}
              <div className="my-2 border-t border-border" />
              {user ? (
                <>
                  <a href="/profile" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg text-foreground/90 hover:text-primary hover:bg-muted transition-colors font-medium">
                    <span className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                      {(profile?.display_name || user.email || "?")[0].toUpperCase()}
                    </span>
                    {profile?.display_name || "Profile"}
                  </a>
                  <button onClick={() => { setOpen(false); handleSignOut(); }}
                    className="py-3 px-3 rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a href="/auth" onClick={() => setOpen(false)}
                    className="py-3 px-3 rounded-lg text-foreground/90 hover:text-primary hover:bg-muted transition-colors font-medium">
                    Sign In
                  </a>
                  <a href="/auth" onClick={() => setOpen(false)}
                    className="mt-2 py-3 text-center font-bold bg-primary text-white rounded-xl shadow-brand hover:opacity-90 transition-opacity">
                    Join Free
                  </a>
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