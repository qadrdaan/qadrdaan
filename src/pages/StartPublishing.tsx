import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Video, Mic, Trophy } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Publish Books", desc: "Upload your poetry collections in PDF or EPUB format and reach thousands of readers worldwide.", link: "/upload-book", cta: "Upload a Book" },
  { icon: Video, title: "Share Videos", desc: "Record and share your poetry recitations, ghazals, and spoken word performances.", link: "/upload-video", cta: "Upload a Video" },
  { icon: Mic, title: "Host Mushairas", desc: "Create and host digital mushaira events, bringing the timeless tradition to a global audience.", link: "/create-mushaira", cta: "Create Mushaira" },
  { icon: Trophy, title: "Run Competitions", desc: "Organize poetry competitions, engage your community, and discover new talent.", link: "/create-competition", cta: "Create Competition" },
];

const StartPublishing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-28 pb-20 container mx-auto px-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-14">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Start <span className="text-gradient-gold">Publishing</span>
        </h1>
        <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
          Qadrdaan gives you everything you need to share your art with the world. Choose how you want to begin.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-card border border-border rounded-2xl flex flex-col"
          >
            <f.icon className="w-10 h-10 text-secondary mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">{f.title}</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{f.desc}</p>
            <Link
              to={f.link}
              className="inline-flex justify-center px-6 py-3 text-sm font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity"
            >
              {f.cta}
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-14 text-center"
      >
        <p className="font-body text-muted-foreground mb-4">Don't have an account yet?</p>
        <Link
          to="/auth"
          className="px-8 py-3 text-sm font-body font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Sign Up Free
        </Link>
      </motion.div>
    </section>
    <Footer />
  </div>
);

export default StartPublishing;
