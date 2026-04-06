import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SponsoredPost from "@/components/SponsoredPost";
import {
  LayoutDashboard, FileText, Image, BookOpen, Wallet, BarChart3,
  Users, Bell, Settings, BadgeCheck, MessageCircle
} from "lucide-react";

const profileNavLinks = [
  { href: "/profile", label: "Overview", icon: LayoutDashboard },
  { href: "/poetry", label: "Posts", icon: FileText },
  { href: "/videos", label: "Media", icon: Image },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/poets", label: "Followers", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/bookmarks", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface DashboardLayoutProps {
  children: ReactNode;
  /** Profile data for the right column stats */
  profileData?: any;
  /** Whether we're viewing our own profile */
  isOwnProfile?: boolean;
  /** User ID of the profile being viewed */
  profileUserId?: string;
  /** Suggested users */
  suggestedUsers?: any[];
}

const DashboardLayout = ({
  children,
  profileData,
  isOwnProfile = true,
  suggestedUsers = [],
}: DashboardLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] xl:grid-cols-[240px_1fr_280px] gap-6">
            {/* Left Sidebar — dashboard nav */}
            <aside className="hidden lg:block sticky top-24 self-start">
              {/* Mini profile */}
              {profileData && (
                <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-brand flex items-center justify-center border-2 border-card overflow-hidden mb-3">
                    {profileData.avatar_url ? (
                      <img src={profileData.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display text-2xl font-bold text-white">
                        {(profileData.display_name || "?")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <p className="font-display text-sm font-bold text-foreground truncate">{profileData.display_name || "User"}</p>
                    {profileData.is_verified && <BadgeCheck className="w-4 h-4 text-secondary shrink-0" />}
                  </div>
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                    {profileData.followers_count || 0} followers
                  </p>
                </div>
              )}

              <nav className="space-y-1">
                {profileNavLinks.map((l) => {
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
              </nav>
            </aside>

            {/* Center Content */}
            <main className="min-w-0 py-4 lg:py-6">
              {children}
            </main>

            {/* Right Sidebar — stats & suggestions */}
            <aside className="hidden lg:block sticky top-24 self-start space-y-6">
              {/* Stats */}
              {profileData && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                  <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">Stats</h3>
                  {[
                    { label: "Followers", value: profileData.followers_count || 0 },
                    { label: "Following", value: profileData.following_count || 0 },
                    { label: "Gifts", value: profileData.total_gifts_received || 0 },
                    { label: "Books", value: profileData.books_count || 0 },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="font-body text-xs text-muted-foreground">{s.label}</span>
                      <span className="font-display text-sm font-bold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested users */}
              {suggestedUsers.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-display text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Suggested</h3>
                  <div className="space-y-3">
                    {suggestedUsers.map((u: any) => (
                      <Link key={u.user_id} to={`/poet/${u.user_id}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {(u.display_name || "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-body text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{u.display_name}</p>
                            {u.is_verified && <BadgeCheck className="w-3 h-3 text-secondary shrink-0" />}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <SponsoredPost placement="profile" />
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile tabs nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around py-2">
          {[profileNavLinks[0], profileNavLinks[1], profileNavLinks[3], profileNavLinks[4], profileNavLinks[5]].map((l) => {
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

export default DashboardLayout;
