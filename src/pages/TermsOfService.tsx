import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const sections = [
  { title: "Acceptance of Terms", content: "By accessing or using Qadrdaan, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform." },
  { title: "User Accounts", content: "You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and all activities that occur under it. You must be at least 13 years old to use our services." },
  { title: "Content Ownership", content: "You retain full ownership of all poetry, books, videos, and other content you publish on Qadrdaan. By uploading content, you grant us a non-exclusive, worldwide license to display, distribute, and promote your content within our platform." },
  { title: "Acceptable Use", content: "You agree not to upload content that is illegal, harmful, threatening, abusive, or infringes on intellectual property rights. We reserve the right to remove content that violates these guidelines and suspend accounts that repeatedly violate our policies." },
  { title: "Mushaira Events", content: "Event organizers are responsible for the conduct of their events. Participants must follow event rules and behave respectfully. Qadrdaan is not liable for disputes between event participants." },
  { title: "Payments & Transactions", content: "Book purchases, gifts, and other transactions are processed through our secure payment system. Refund policies apply as specified at the time of purchase. Creators are responsible for applicable taxes on their earnings." },
  { title: "Limitation of Liability", content: "Qadrdaan is provided 'as is' without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform." },
  { title: "Termination", content: "We may suspend or terminate your account for violation of these terms. You may delete your account at any time. Upon termination, your published content may be removed from the platform." },
  { title: "Changes to Terms", content: "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms." },
];

const TermsOfService = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Terms of <span className="text-gradient-gold">Service</span>
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-10">Last updated: March 8, 2026</p>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">{i + 1}. {s.title}</h2>
              <p className="font-body text-muted-foreground leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
    <Footer />
  </div>
);

export default TermsOfService;
