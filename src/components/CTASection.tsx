import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section id="community" className="py-24 bg-gradient-hero relative overflow-hidden">
    {/* Decorative */}
    <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-gold/5 blur-3xl" />
    <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-gold/5 blur-3xl" />

    <div className="relative z-10 container mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
          Your Poetry Deserves <br />
          <span className="text-gradient-gold">A Global Stage</span>
        </h2>
        <p className="font-body text-lg text-primary-foreground/60 max-w-xl mx-auto mb-10">
          Join thousands of poets, writers, and literature lovers on Qadrdaan — 
          the world's most vibrant poetry platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-10 py-4 font-body font-bold text-lg bg-gradient-gold rounded-xl text-primary shadow-gold hover:opacity-90 transition-all hover:scale-105">
            Create Your Profile
          </button>
          <button className="px-10 py-4 font-body font-semibold text-lg border-2 border-gold/30 text-primary-foreground rounded-xl hover:border-gold/60 transition-all">
            Browse Poetry
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
