import { motion } from "framer-motion";
import { BookOpen, Mic, Gift, Video, Users, Trophy } from "lucide-react";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-gold/20">
    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
      <a href="/" className="font-display text-2xl font-bold text-primary-foreground tracking-wide">
        Qadrdaan
      </a>
      <div className="hidden md:flex items-center gap-8 font-body text-sm text-primary-foreground/80">
        <a href="#features" className="hover:text-gold transition-colors">Features</a>
        <a href="#mushaira" className="hover:text-gold transition-colors">Mushaira</a>
        <a href="#creators" className="hover:text-gold transition-colors">Poets</a>
        <a href="#community" className="hover:text-gold transition-colors">Community</a>
      </div>
      <div className="flex items-center gap-3">
        <button className="hidden sm:block px-4 py-2 text-sm font-body text-primary-foreground/90 hover:text-gold transition-colors">
          Sign In
        </button>
        <button className="px-5 py-2.5 text-sm font-body font-semibold bg-gradient-gold rounded-lg text-primary shadow-gold hover:opacity-90 transition-opacity">
          Join Free
        </button>
      </div>
    </div>
  </nav>
);

export default Navbar;
