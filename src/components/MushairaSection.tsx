import { motion } from "framer-motion";
import { Radio, MessageCircle, Heart, Gift } from "lucide-react";
import mushairaImg from "@/assets/mushaira-bg.jpg";

const capabilities = [
  { icon: Radio, text: "Live Poetry Performances" },
  { icon: MessageCircle, text: "Real-time Audience Chat" },
  { icon: Heart, text: "Live Reactions & Applause" },
  { icon: Gift, text: "Send Gifts During Events" },
];

const MushairaSection = () => (
  <section id="mushaira" className="py-24 relative overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      <img src={mushairaImg} alt="Digital Mushaira" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-primary/90" />
    </div>

    <div className="relative z-10 container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="font-body text-sm tracking-[0.2em] uppercase text-gold mb-3">Revolutionary Feature</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Digital <span className="text-gradient-gold">Mushaira</span>
          </h2>
          <p className="font-body text-primary-foreground/70 text-lg leading-relaxed mb-8">
            Experience the magic of traditional poetry gatherings — reimagined for the digital age. 
            Perform live, connect with a global audience, receive real-time reactions, and earn gifts 
            from admirers around the world.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {capabilities.map((cap) => (
              <div
                key={cap.text}
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-light/20 border border-gold/10"
              >
                <cap.icon className="w-5 h-5 text-gold shrink-0" />
                <span className="font-body text-sm text-primary-foreground/80">{cap.text}</span>
              </div>
            ))}
          </div>

          <button className="mt-10 px-8 py-4 font-body font-semibold bg-gradient-gold rounded-xl text-primary shadow-gold hover:opacity-90 transition-all hover:scale-105">
            Join a Mushaira
          </button>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Mushaira event card mockup */}
          <div className="bg-emerald-light/30 backdrop-blur-md rounded-3xl p-8 border border-gold/20">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="font-body text-sm text-gold font-semibold">LIVE NOW</span>
            </div>
            <h3 className="font-display text-2xl text-primary-foreground font-bold mb-2">
              International Ghazal Night
            </h3>
            <p className="font-body text-primary-foreground/60 text-sm mb-6">
              Featuring poets from 12 countries performing classic and modern ghazals
            </p>
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <p className="font-display text-xl font-bold text-gold">2.4K</p>
                <p className="font-body text-xs text-primary-foreground/50">Watching</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold text-gold">156</p>
                <p className="font-body text-xs text-primary-foreground/50">Gifts Sent</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold text-gold">8</p>
                <p className="font-body text-xs text-primary-foreground/50">Poets</p>
              </div>
            </div>
            {/* Chat preview */}
            <div className="space-y-3">
              {[
                { name: "Amina K.", msg: "Wah wah! Beautiful ghazal 🌹" },
                { name: "Ravi S.", msg: "Standing ovation from Delhi! 👏" },
                { name: "Sara M.", msg: "This is magical ✨" },
              ].map((chat) => (
                <div key={chat.name} className="flex items-start gap-2 p-2 rounded-lg bg-primary/30">
                  <div className="w-6 h-6 rounded-full bg-gold/30 shrink-0 flex items-center justify-center">
                    <span className="text-xs font-body font-bold text-gold">{chat.name[0]}</span>
                  </div>
                  <div>
                    <span className="font-body text-xs font-semibold text-gold">{chat.name}</span>
                    <p className="font-body text-xs text-primary-foreground/70">{chat.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default MushairaSection;
