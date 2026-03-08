import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      <img src={heroBg} alt="Poetry and literature" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-hero opacity-85" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-primary/60" />
    </div>

    {/* Floating decorative elements */}
    <motion.div
      className="absolute top-20 left-10 w-2 h-2 rounded-full bg-gold/40"
      animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    <motion.div
      className="absolute top-40 right-20 w-3 h-3 rounded-full bg-gold/30"
      animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
      transition={{ duration: 5, repeat: Infinity, delay: 1 }}
    />
    <motion.div
      className="absolute bottom-40 left-1/4 w-1.5 h-1.5 rounded-full bg-gold/50"
      animate={{ y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
    />

    {/* Content */}
    <div className="relative z-10 container mx-auto px-6 text-center pt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="font-body text-gold-light text-sm tracking-[0.3em] uppercase mb-6">
          The World's Stage for Poetry & Literature
        </p>
      </motion.div>

      <motion.h1
        className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-tight mb-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Welcome to{" "}
        <span className="text-gradient-gold">Qadrdaan</span>
      </motion.h1>

      <motion.p
        className="font-body text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Publish your poetry. Perform in live mushairas. Sell your books. 
        Connect with readers worldwide. Your literary journey begins here.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <button className="px-8 py-4 font-body font-semibold text-base bg-gradient-gold rounded-xl text-primary shadow-gold hover:opacity-90 transition-all hover:scale-105">
          Start Publishing
        </button>
        <button className="px-8 py-4 font-body font-semibold text-base border-2 border-gold/30 text-primary-foreground rounded-xl hover:border-gold/60 transition-all hover:bg-gold/10">
          Explore Poetry
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="mt-20 grid grid-cols-3 max-w-lg mx-auto gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        {[
          { value: "50K+", label: "Poets" },
          { value: "200K+", label: "Poems" },
          { value: "30+", label: "Languages" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-2xl md:text-3xl font-bold text-gold">{stat.value}</p>
            <p className="font-body text-sm text-primary-foreground/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>

    {/* Bottom fade */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
  </section>
);

export default HeroSection;
