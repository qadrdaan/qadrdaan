import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Camera, Mic, Bell, FolderOpen, MapPin, Contact, Wifi, Vibrate } from "lucide-react";

const sections = [
  { title: "Information We Collect", content: "We collect information you provide directly — name, email, CNIC (for age & duplicate-account prevention), date of birth, profile details, and content you publish (poetry, books, videos, comments). We also collect usage data (pages viewed, reading time, reactions, device model, OS, IP-derived country) to improve recommendations and detect abuse." },
  { title: "How We Use Your Information", content: "To deliver and personalize the feed, process coin purchases & creator withdrawals through secure payment gateways, send notifications you've opted into, enforce community guidelines via AI moderation (Gemini), and improve the platform. We never sell personal data to third parties." },
  { title: "Content You Publish", content: "Poetry, books, videos and other works remain your intellectual property. By publishing on Qadrdaan you grant us a non-exclusive license to host, display, translate and distribute that content within the platform and its embeds." },
  { title: "Data Security", content: "Data is encrypted in transit (TLS) and at rest. Row-Level Security policies isolate user data. Withdrawals above PKR-equivalent thresholds require manual admin review. No system is 100% secure — report suspected breaches to security@qadrdaan.com." },
  { title: "Cookies & Tracking", content: "Essential cookies maintain your session. Analytics cookies measure aggregate engagement. You can clear them anytime in your browser settings." },
  { title: "Your Rights", content: "You may access, correct, export or delete your personal data at any time via Profile → Settings, or by emailing privacy@qadrdaan.com. Account deletion removes posts within 30 days; backups are purged within 90 days." },
  { title: "Children", content: "Qadrdaan is restricted to users 18+ (verified by CNIC + date of birth at signup). We do not knowingly collect data from minors." },
  { title: "International Transfers", content: "Servers are hosted on managed infrastructure in the EU/US. By using the app you consent to cross-border processing." },
  { title: "Changes to This Policy", content: "We may update this policy and will notify you via in-app banner or email at least 14 days before material changes take effect." },
];

const permissions = [
  { icon: Camera,    name: "Camera",        purpose: "Record short videos & mushaira clips, scan QR for referrals, take profile photos." },
  { icon: Mic,       name: "Microphone",    purpose: "Record audio narrations of poetry, join live video-mushaira rooms (WebRTC)." },
  { icon: Bell,      name: "Notifications", purpose: "Deliver push alerts for reactions, comments, gifts, follows, mushaira-live, competition wins. Controlled per-type in Notification Settings." },
  { icon: FolderOpen,name: "Storage / Media", purpose: "Pick photos, videos and PDFs/ePubs from your device to upload as posts, books or covers." },
  { icon: MapPin,    name: "Location (optional)", purpose: "Tag a location on a post (Facebook-style). Only used when you tap 'Add location' — never collected silently." },
  { icon: Contact,   name: "Contacts (optional)", purpose: "Invite friends via the Referral program. Contacts are read on-device and never uploaded to our servers." },
  { icon: Wifi,      name: "Network State", purpose: "Detect online/offline status to queue uploads and show connection quality during live mushaira." },
  { icon: Vibrate,   name: "Vibrate",       purpose: "Subtle haptic feedback for reactions, gifts and incoming live-room invites." },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Privacy <span className="text-gradient-gold">Policy</span>
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-10">Last updated: May 11, 2026 · Applies to the Qadrdaan web app and Android (Play Store) build.</p>

        <div className="bg-card border border-border rounded-2xl p-6 mb-10">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">App Permissions</h2>
          <p className="font-body text-sm text-muted-foreground mb-5">
            The wrapped Android (AAB) build requests the following permissions. Each is used <strong>only</strong> for the stated purpose and can be revoked anytime via system settings.
          </p>
          <ul className="space-y-4">
            {permissions.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.name} className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-body font-bold text-sm text-foreground">{p.name}</p>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{p.purpose}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">{s.title}</h2>
              <p className="font-body text-muted-foreground leading-relaxed">{s.content}</p>
            </div>
          ))}
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Contact</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              Privacy questions: privacy@qadrdaan.com · Billing & support: support@qadrdaan.com · Postal: Qadrdaan, Pakistan.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
    <Footer />
  </div>
);

export default PrivacyPolicy;
