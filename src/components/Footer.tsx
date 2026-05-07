import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const Footer = () => (
  <footer className="bg-primary py-6 border-t border-gold/10">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo />
          <p className="font-body text-[11px] text-primary-foreground/40 hidden sm:block">
            © 2026 Qadrdaan · Built for poetry lovers worldwide
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 font-body text-[11px] text-primary-foreground/60">
          <Link to="/about" className="hover:text-gold transition-colors">About</Link>
          <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
          <Link to="/user-guide" className="hover:text-gold transition-colors">User Guide</Link>
          <Link to="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
          <Link to="/refund" className="hover:text-gold transition-colors">Refunds</Link>
        </nav>
      </div>
      <p className="font-body text-[10px] text-primary-foreground/30 text-center mt-3 sm:hidden">
        © 2026 Qadrdaan · All rights reserved
      </p>
    </div>
  </footer>
);

export default Footer;
