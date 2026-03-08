import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Get in <span className="text-gradient-gold">Touch</span>
          </h1>
          <p className="font-body text-lg text-muted-foreground mb-10">
            Have a question, suggestion, or partnership idea? We'd love to hear from you.
          </p>

          <div className="flex flex-wrap gap-6 mb-10">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-secondary" />
              <span className="font-body text-foreground">support@qadrdaan.com</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-secondary" />
              <span className="font-body text-foreground">Worldwide (Remote)</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary"
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary resize-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-8 py-3.5 font-body font-semibold bg-gradient-gold rounded-xl text-primary shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
