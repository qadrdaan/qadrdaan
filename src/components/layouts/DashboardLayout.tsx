import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SponsoredPost from "@/components/SponsoredPost";
import BirthdaysWidget from "@/components/BirthdaysWidget";
import MemoriesWidget from "@/components/MemoriesWidget";
import {
  LayoutDashboard, FileText, Image, BookOpen, Wallet, BarChart3,
  Users, Bell, Settings, BadgeCheck, MessageCircle, Trash2
} from "lucide-react";

const sidebarGroups = [
  {
    label: null,
    items: [
      { href: "/profile", label: "Overview", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/poetry", label: "Posts", icon: FileText },
      { href: "/videos", label: "Media", icon: Image },
      { href: "/books", label: "Books", icon: BookOpen },
    ],
  },
  {
    label: "Monetization",
    items: [
      { href: "/wallet", label: "Wallet & Gifts", icon: Wallet },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Social",
    items: [
      { href: "/poets", label: "Followers", icon: Users },
      { href: "/messages", label: "Messages", icon: MessageCircle },
      { href: "/bookmarks", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/trash", label: "Trash", icon: Trash2 },
    ],
  },
];

const allLinks = sidebarGroups.flatMap(g => g.items);

interface DashboardLayoutProps {
  children: ReactNode;
  profileData?: any;
  isOwnProfile?: boolean;
  profileUserId?: string;
  suggestedUsers?: any[];
}

const DashboardLayout = ({ children, profileData, isOwnProfile = true, suggestedUsers = [] }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] xl:grid-cols-[240px_1fr_300px] gap-6">
            {/* Left Sidebar */}
            <aside className="hidden lg:block sticky top-24 self-start">
              {profileData && (
                <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-brand flex items-center justify-center border-2 border-card overflow-hidden mb-3">
                    {profileData.avatar_url ? (
                      <img src={profileData.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display text-2xl font-bold text-primary-foreground">
                        {(profileData.display_name || "?")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <p className="font-display text-sm font-bold text-foreground truncate">{profileData.display_name || "User"}</p>
                    {profileData.is_verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                    {profileData.followers_count || 0} followers
                  </p>
                </div>
              )}

              <nav className="space-y-1">
                {sidebarGroups.map((group, gi) => (
                  <div key={gi}>
                    {group.label && (
                      <p className="px-3 pt-4 pb-1 font-body text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {group.label}
                      </p>
                    )}
                    {group.items.map((l) => {
                      const active = location.pathname === l.href || (l.href.includes('#') && location.pathname + location.hash === l.href);
                      return (
                        <Link key={l.href} to={l.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl font-body text-sm font-medium transition-colors ${
                            active ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                          }`}>
                          <l.icon className="w-[18px] h-[18px] shrink-0" />
                          {l.label}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </aside>

            {/* Center */}
            <main className="min-w-0 py-4 lg:py-6">{children}</main>

            {/* Right Sidebar */}
            <aside className="hidden lg:block sticky top-24 self-start space-y-5">
              {/* Sponsored Ads */}
              <SponsoredPost placement="profile" />

              {/* Birthdays */}
              <BirthdaysWidget />

              {/* Memories */}
              <MemoriesWidget />

              {suggestedUsers.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-display text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Suggested</h3>
                  <div className="space-y-3">
                    {suggestedUsers.map((u: any) => (
                      <Link key={u.user_id} to={`/poet/${u.user_id}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                          {(u.display_name || "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-body text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{u.display_name}</p>
                            {u.is_verified && <BadgeCheck className="w-3 h-3 text-primary shrink-0" />}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around py-2">
          {[allLinks[0], allLinks[1], allLinks[3], allLinks[6], allLinks[8]].map((l) => {
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
