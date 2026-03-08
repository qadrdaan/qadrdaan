import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Heart, Globe, Users, BookOpen } from "lucide-react";

const values = [
  { icon: Heart, title: "Passion for Poetry", desc: "We believe poetry is the soul's language, and every voice deserves to be heard on a global stage." },
  { icon: Globe, title: "Global Community", desc: "Connecting poets and readers across 30+ languages and every corner of the world." },
  { icon: Users, title: "Creator First", desc: "We empower poets to publish, perform, and earn — putting creators at the heart of everything we do." },
  { icon: BookOpen, title: "Preserving Tradition", desc: "Honoring the rich heritage of mushaira culture while embracing modern digital expression." },
];

const AboutUs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-28 pb-20 container mx-auto px-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
          About <span className="text-gradient-gold">Qadrdaan</span>
        </h1>
        <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
          Qadrdaan is the world's largest digital stage for poetry, literature, and mushaira culture. 
          Founded with the vision of preserving and celebrating the art of poetry, we provide a platform 
          where poets can publish their work, perform in live digital mushairas, sell their books, 
          and connect with a global audience of poetry lovers.
        </p>
        <p className="font-body text-lg text-muted-foreground leading-relaxed mb-12">
          Our name, "Qadrdaan" (قدردان), means "one who appreciates" — and that's exactly what we do. 
          We appreciate the beauty of words, the power of expression, and the timeless tradition of 
          sharing poetry in community.
        </p>
      </motion.div>

      <motion.div
        className="grid sm:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {values.map((v) => (
          <div key={v.title} className="p-6 bg-card border border-border rounded-2xl">
            <v.icon className="w-8 h-8 text-secondary mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">{v.title}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </motion.div>
    </section>
    <Footer />
  </div>
);

export default AboutUs;
