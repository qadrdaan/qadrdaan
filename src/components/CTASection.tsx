import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section id="community" className="py-24 bg-slate-950 relative overflow-hidden">
    {/* Decorative */}
    <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
    <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />

    <div className="relative z-10 container mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Your Poetry Deserves <br />
          <span className="text-gradient-brand">A Global Stage</span>
        </h2>
        <p className="font-body text-lg text-white/60 max-w-xl mx-auto mb-10">
          Join thousands of poets, writers, and literature lovers on qadrdaan — 
          the world's most vibrant poetry platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth" className="px-10 py-4 font-body font-bold text-lg bg-primary text-white rounded-full shadow-brand hover:opacity-90 transition-all hover:scale-105">
            Create Your Profile
          </Link>
          <Link to="/books" className="px-10 py-4 font-body font-bold text-lg border-2 border-white/20 text-white rounded-full hover:bg-white/10 transition-all">
            Browse Poetry
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;