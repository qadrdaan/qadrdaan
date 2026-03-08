import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Megaphone, TrendingUp, Eye, Zap } from "lucide-react";

const promoOptions = [
  { icon: TrendingUp, title: "Featured Placement", desc: "Get your books and videos featured on the homepage and discovery sections, reaching thousands of poetry lovers daily." },
  { icon: Eye, title: "Boosted Visibility", desc: "Your content appears higher in search results and recommendation feeds, driving more readers and followers to your profile." },
  { icon: Megaphone, title: "Event Promotion", desc: "Promote your mushaira events and competitions across the platform to maximize attendance and participation." },
  { icon: Zap, title: "Social Highlights", desc: "Get highlighted in our weekly newsletter and social media channels, expanding your reach beyond the platform." },
];

const Promotions = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-28 pb-20 container mx-auto px-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          <span className="text-gradient-gold">Promotions</span>
        </h1>
        <p className="font-body text-lg text-muted-foreground leading-relaxed mb-12 max-w-2xl">
          Amplify your reach on Qadrdaan. Our promotion tools help creators get discovered by the right audience at the right time.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {promoOptions.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-card border border-border rounded-2xl"
          >
            <p.icon className="w-8 h-8 text-secondary mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">{p.title}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-8 bg-card border border-secondary/20 rounded-2xl text-center"
      >
        <h2 className="font-display text-xl font-bold text-foreground mb-3">Interested in Promoting Your Work?</h2>
        <p className="font-body text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
          Reach out to our team to discuss promotion options tailored to your needs and budget.
        </p>
        <Link
          to="/contact"
          className="inline-flex px-8 py-3 text-sm font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity"
        >
          Get in Touch
        </Link>
      </motion.div>
    </section>
    <Footer />
  </div>
);

export default Promotions;
