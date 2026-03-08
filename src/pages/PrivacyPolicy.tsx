import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const sections = [
  { title: "Information We Collect", content: "We collect information you provide directly, such as your name, email address, profile details, and content you publish. We also collect usage data including pages visited, interactions, and device information to improve our platform." },
  { title: "How We Use Your Information", content: "Your information is used to provide and improve our services, personalize your experience, communicate with you, process transactions, and ensure the security of our platform. We never sell your personal data to third parties." },
  { title: "Content You Publish", content: "Poetry, books, videos, and other content you publish on Qadrdaan remains your intellectual property. By publishing, you grant us a license to display and distribute your content on our platform as part of the service." },
  { title: "Data Security", content: "We implement industry-standard security measures to protect your personal information. This includes encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure." },
  { title: "Cookies & Tracking", content: "We use essential cookies for authentication and session management. Analytics cookies help us understand how you use our platform. You can manage cookie preferences through your browser settings." },
  { title: "Your Rights", content: "You have the right to access, correct, or delete your personal data at any time. You can also request a copy of your data or ask us to restrict processing. Contact us at privacy@qadrdaan.com for any requests." },
  { title: "Changes to This Policy", content: "We may update this privacy policy from time to time. We will notify you of any significant changes through email or a notice on our platform. Continued use after changes constitutes acceptance." },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Privacy <span className="text-gradient-gold">Policy</span>
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-10">Last updated: March 8, 2026</p>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">{s.title}</h2>
              <p className="font-body text-muted-foreground leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
    <Footer />
  </div>
);

export default PrivacyPolicy;
