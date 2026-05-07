import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Feather, Video, Mic2, Trophy, Gift, Coins, Wallet as WalletIcon, Shield, Users, BookMarked, Sparkles, Settings, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const SECTIONS: { icon: any; title: string; body: string; cta?: { label: string; to: string } }[] = [
  { icon: Feather,    title: "Posting Poetry",       body: "Tap the home icon, then write your ghazal, nazm, naat, or quote. Pick a category and language. Tag a feeling and location like Facebook. The AI poetry analyzer instantly checks bahr, qafiya, and radif.", cta: { label: "Create a post", to: "/create-post" } },
  { icon: BookOpen,   title: "Books Marketplace",    body: "Upload PDF or ePub. Toggle Free or Paid (set your own price + currency). Buyers get a 5-page preview before purchase. Earn 70% royalty per sale.", cta: { label: "Upload a book", to: "/upload-book" } },
  { icon: Video,      title: "Videos & Shorts",      body: "Upload long-form (16:9) or Shorts (9:16). Every video carries an invisible creator-ID watermark to prevent piracy. Earn from views and gifts.", cta: { label: "Upload video", to: "/upload-video" } },
  { icon: Mic2,       title: "Live Mushaira Rooms",  body: "Up to 30 WebRTC seats. Audience joins free, performers queue up, scoreboard shows live gifts. Followers get a 🔴 push when you go live.", cta: { label: "Browse rooms", to: "/video-rooms" } },
  { icon: Trophy,     title: "Competitions & Challenges", body: "Submit an entry, gather votes + gifts before deadline. The system auto-awards a gold medal hourly when voting closes." },
  { icon: Gift,       title: "Gifts & Coins",        body: "Buy coins via Easypaisa (0092 302 4771572). Send roses, crowns, or moons to creators. Creators receive 60%, platform retains 40% (with 40% reinvest obligation)." },
  { icon: Coins,      title: "Reinvestment Tracker", body: "After receiving gifts, you must spend at least 40% of those coins on ads or post boosts. The tracker on your wallet shows your live obligation." },
  { icon: WalletIcon, title: "Wallet & Withdrawals", body: "Cash out once you hit $20. Verified poets pay 12% fee, standard 15%, new accounts (<30 days) 18%. Manual review takes 1–3 business days." },
  { icon: Sparkles,   title: "Monetization Eligibility", body: "Hit 8,000 followers AND 400,000 reading-minutes in 60 days to unlock ad-share earnings." },
  { icon: Users,      title: "Fan Clubs",            body: "1,000 followers required. Set $3/mo subscription. Members access exclusive posts and private chat." },
  { icon: BookMarked, title: "Verification (Blue Badge)", body: "Refer 100 active users (CNIC-locked) OR get manually approved by admin. Verification reduces withdrawal fees by 3%." },
  { icon: Shield,     title: "Community Safety",     body: "Gemini Flash AI auto-moderates every post against Islamic and platform guidelines. Three Strike Rule: warning → 7-day suspension → permanent ban." },
  { icon: Bell,       title: "Notifications",        body: "Granular control in Settings. Browser push covers reactions, gifts, comments, follows, mushaira-live, and competition wins.", cta: { label: "Open settings", to: "/notification-settings" } },
  { icon: Settings,   title: "Profile & Languages",  body: "Switch between 50+ languages including Pakistani Urdu, Pakistani Punjabi (Shahmukhi), and Indian Punjabi (Gurmukhi). Add up to 5 preferred languages." },
];

const UserGuide = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-28 pb-16 container mx-auto px-6 max-w-4xl">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">User Guide</h1>
      <p className="font-body text-base text-muted-foreground mb-10 max-w-2xl">
        Everything you can do on Qadrdaan — the world's largest digital stage for poetry, mushaira, and literary culture.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-base font-bold text-foreground">{s.title}</h2>
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              {s.cta && (
                <Link to={s.cta.to} className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-primary hover:underline">
                  {s.cta.label} →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-5 bg-gradient-to-br from-primary/10 to-secondary/10 border border-border rounded-2xl">
        <h3 className="font-display text-lg font-bold text-foreground mb-2">Need more help?</h3>
        <p className="font-body text-sm text-muted-foreground mb-3">
          Email <a href="mailto:support@qadrdaan.com" className="text-primary font-bold">support@qadrdaan.com</a> or message us on Easypaisa-listed WhatsApp <a href="tel:+923024771572" className="text-primary font-bold">0092 302 4771572</a>.
        </p>
      </div>
    </section>
    <Footer />
  </div>
);

export default UserGuide;
