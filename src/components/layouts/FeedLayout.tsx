import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SponsoredPost from "@/components/SponsoredPost";
import { BadgeCheck, Compass, BookOpen, Wallet, BarChart3, User, Tv, Home, Flame, Bookmark, Play } from "lucide-react";

const feedNavLinks = [
  { href: "/poetry", label: "Feed", icon: Home },
  { href: "/discover", label: "Explore", icon: Compass },
  { href: "/shorts", label: "Shorts", icon: Play },
  { href: "/videos", label: "Live", icon: Tv },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
];

interface FeedLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
  trendingPoets?: any[];
}

const FeedLayout = ({ children, showRightSidebar = true, trendingPoets = [] }: FeedLayoutProps) => {
  const { user, profile } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] xl:grid-cols-[240px_1fr_300px] gap-6">
            {/* Left Sidebar */}
            <aside className="hidden lg:block sticky top-24 self-start space-y-1">
              {user && (
                <Link to="/profile" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors mb-4">
                  <span className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {(profile?.display_name || "?")[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-body text-sm font-bold text-foreground truncate">{profile?.display_name || "Profile"}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Your profile</p>
                  </div>
                </Link>
              )}
              {feedNavLinks.map((l) => {
                const active = location.pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    to={l.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <l.icon className="w-[18px] h-[18px] shrink-0" />
                    {l.label}
                  </Link>
                );
              })}
            </aside>

            {/* Center Content */}
            <main className="min-w-0 max-w-2xl w-full mx-auto py-4 lg:py-6">
              {children}
            </main>

            {/* Right Sidebar — Ads first, then Creators */}
            {showRightSidebar && (
              <aside className="hidden lg:block sticky top-24 self-start space-y-5">
                {/* Sponsored Ads */}
                <SponsoredPost placement="feed" />

                {/* Creators to Follow */}
                {trendingPoets.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <Flame className="w-4 h-4 text-primary" /> Creators to Follow
                    </h3>
                    <div className="space-y-3">
                      {trendingPoets.map((poet: any) => (
                        <Link key={poet.user_id} to={`/poet/${poet.user_id}`} className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {(poet.display_name || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-body text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{poet.display_name}</p>
                              {poet.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-secondary shrink-0" />}
                            </div>
                            <p className="font-body text-[10px] text-muted-foreground">{poet.followers_count} followers</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link to="/poets" className="block text-center mt-4 font-body text-xs font-bold text-primary hover:underline uppercase tracking-widest">
                      View All
                    </Link>
                  </div>
                )}

                {/* Trending tags */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-display text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Trending</h3>
                  <div className="flex flex-wrap gap-2">
                    {["#Poetry", "#Ghazal", "#Urdu", "#Love", "#Mushaira", "#Books"].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-body font-medium hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around py-2">
          {[feedNavLinks[0], feedNavLinks[1], feedNavLinks[2], feedNavLinks[7], feedNavLinks[8]].map((l) => {
            const active = location.pathname === l.href;
            return (
              <Link key={l.href} to={l.href} className={`flex flex-col items-center gap-0.5 p-1.5 ${active ? "text-primary" : "text-muted-foreground"}`}>
                <l.icon className="w-5 h-5" />
                <span className="text-[10px] font-body font-medium">{l.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="pb-16 lg:pb-0">
        <Footer />
      </div>
    </div>
  );
};

export default FeedLayout;
