import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { href: "/poetry", label: "Poetry" },
  { href: "/books", label: "Books" },
  { href: "/videos", label: "Videos" },
  { href: "/poets", label: "Poets" },
  { href: "/mushairas", label: "Mushaira" },
  { href: "/competitions", label: "Competitions" },
  { href: "/discover", label: "Discover" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/gift-shop", label: "Gift Shop" },
];

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

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
        <div className="hidden md:flex items-center gap-8 font-body text-sm text-primary-foreground/80">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-accent transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <a
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-body text-primary-foreground/90 hover:text-accent transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary">
                    {(profile?.display_name || user.email || "?")[0].toUpperCase()}
                  </span>
                  <span>{profile?.display_name || "Profile"}</span>
                </a>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a
                  href="/auth"
                  className="px-4 py-2 text-sm font-body text-primary-foreground/90 hover:text-accent transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/auth"
                  className="px-5 py-2.5 text-sm font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity"
                >
                  Join Free
                </a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-primary-foreground/80 hover:text-accent transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-primary/98 border-t border-gold/10"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-1 font-body text-sm">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-3 px-3 rounded-lg text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/5 transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="my-2 border-t border-gold/10" />
              {user ? (
                <>
                  <a
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg text-primary-foreground/90 hover:text-accent hover:bg-primary-foreground/5 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary">
                      {(profile?.display_name || user.email || "?")[0].toUpperCase()}
                    </span>
                    {profile?.display_name || "Profile"}
                  </a>
                  <button
                    onClick={() => { setOpen(false); handleSignOut(); }}
                    className="py-3 px-3 rounded-lg text-left text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/auth"
                    onClick={() => setOpen(false)}
                    className="py-3 px-3 rounded-lg text-primary-foreground/90 hover:text-accent hover:bg-primary-foreground/5 transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="/auth"
                    onClick={() => setOpen(false)}
                    className="mt-1 py-3 text-center font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity"
                  >
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
