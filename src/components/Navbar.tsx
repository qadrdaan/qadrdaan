import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();

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
        <div className="hidden md:flex items-center gap-8 font-body text-sm text-primary-foreground/80">
          <a href="/books" className="hover:text-accent transition-colors">Books</a>
          <a href="/videos" className="hover:text-accent transition-colors">Videos</a>
          <a href="/poets" className="hover:text-accent transition-colors">Poets</a>
          <a href="/mushairas" className="hover:text-accent transition-colors">Mushaira</a>
          <a href="/competitions" className="hover:text-accent transition-colors">Competitions</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <a
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm font-body text-primary-foreground/90 hover:text-accent transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary">
                  {(profile?.display_name || user.email || "?")[0].toUpperCase()}
                </span>
                <span className="hidden sm:inline">{profile?.display_name || "Profile"}</span>
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
                className="hidden sm:block px-4 py-2 text-sm font-body text-primary-foreground/90 hover:text-accent transition-colors"
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
      </div>
    </nav>
  );
};

export default Navbar;
