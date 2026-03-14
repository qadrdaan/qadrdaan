import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-gold/20">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-display text-2xl font-bold text-primary-foreground tracking-wide">
          Qadrdaan
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6 font-body text-sm text-primary-foreground/80">
          {mainLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-accent transition-colors">
              {l.label}
            </a>
          ))}

          {/* More dropdown */}
          <div className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
            <button className="flex items-center gap-1 hover:text-accent transition-colors">
              More <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-2 z-50"
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
              <button className="flex items-center gap-1 hover:text-accent transition-colors">
                Creator <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-lg py-2 z-50 hidden group-hover:block">
                {creatorLinks.map((l) => (
                  <a key={l.href} href={l.href} className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm font-body text-primary-foreground/90 hover:text-accent transition-colors">
                  <span className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary">
                    {(profile?.display_name || user.email || "?")[0].toUpperCase()}
                  </span>
                  <span>{profile?.display_name || "Profile"}</span>
                </a>
                <button onClick={handleSignOut} className="px-4 py-2 text-sm font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a href="/auth" className="px-4 py-2 text-sm font-body text-primary-foreground/90 hover:text-accent transition-colors">
                  Sign In
                </a>
                <a href="/auth" className="px-5 py-2.5 text-sm font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity">
                  Join Free
                </a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-primary-foreground/80 hover:text-accent transition-colors" aria-label="Toggle menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-primary/98 border-t border-gold/10 max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto px-6 py-4 flex flex-col gap-1 font-body text-sm">
              {[...mainLinks, ...moreLinks].map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="py-3 px-3 rounded-lg text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/5 transition-colors">
                  {l.label}
                </a>
              ))}
              {user && (
                <>
                  <div className="my-2 border-t border-gold/10" />
                  <p className="px-3 py-1 text-xs text-gold uppercase tracking-wider">Creator</p>
                  {creatorLinks.map((l) => (
                    <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                      className="py-3 px-3 rounded-lg text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/5 transition-colors">
                      {l.label}
                    </a>
                  ))}
                </>
              )}
              <div className="my-2 border-t border-gold/10" />
              {user ? (
                <>
                  <a href="/profile" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg text-primary-foreground/90 hover:text-accent hover:bg-primary-foreground/5 transition-colors">
                    <span className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary">
                      {(profile?.display_name || user.email || "?")[0].toUpperCase()}
                    </span>
                    {profile?.display_name || "Profile"}
                  </a>
                  <button onClick={() => { setOpen(false); handleSignOut(); }}
                    className="py-3 px-3 rounded-lg text-left text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a href="/auth" onClick={() => setOpen(false)}
                    className="py-3 px-3 rounded-lg text-primary-foreground/90 hover:text-accent hover:bg-primary-foreground/5 transition-colors">
                    Sign In
                  </a>
                  <a href="/auth" onClick={() => setOpen(false)}
                    className="mt-1 py-3 text-center font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity">
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
