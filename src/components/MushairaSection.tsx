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
      <div className="absolute inset-0 bg-slate-950/90" />
    </div>

    <div className="relative z-10 container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="font-body text-sm tracking-[0.2em] uppercase text-primary font-bold mb-3">Revolutionary Feature</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Digital <span className="text-gradient-brand">Mushaira</span>
          </h2>
          <p className="font-body text-white/70 text-lg leading-relaxed mb-8">
            Experience the magic of traditional poetry gatherings — reimagined for the digital age. 
            Perform live, connect with a global audience, receive real-time reactions, and earn gifts 
            from admirers around the world.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {capabilities.map((cap) => (
              <div
                key={cap.text}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <cap.icon className="w-5 h-5 text-secondary shrink-0" />
                <span className="font-body text-sm text-white/80">{cap.text}</span>
              </div>
            ))}
          </div>

          <button className="mt-10 px-8 py-4 font-body font-bold bg-primary text-white rounded-full shadow-brand hover:opacity-90 transition-all hover:scale-105">
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
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="font-body text-xs text-red-500 font-bold uppercase tracking-widest">LIVE NOW</span>
            </div>
            <h3 className="font-display text-2xl text-white font-bold mb-2">
              International Ghazal Night
            </h3>
            <p className="font-body text-white/60 text-sm mb-6">
              Featuring poets from 12 countries performing classic and modern ghazals
            </p>
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <p className="font-display text-xl font-bold text-primary">2.4K</p>
                <p className="font-body text-[10px] text-white/40 uppercase font-bold">Watching</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold text-secondary">156</p>
                <p className="font-body text-[10px] text-white/40 uppercase font-bold">Gifts Sent</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold text-accent">8</p>
                <p className="font-body text-[10px] text-white/40 uppercase font-bold">Poets</p>
              </div>
            </div>
            {/* Chat preview */}
            <div className="space-y-3">
              {[
                { name: "Amina K.", msg: "Wah wah! Beautiful ghazal 🌹", color: "bg-primary/20" },
                { name: "Ravi S.", msg: "Standing ovation from Delhi! 👏", color: "bg-secondary/20" },
                { name: "Sara M.", msg: "This is magical ✨", color: "bg-accent/20" },
              ].map((chat) => (
                <div key={chat.name} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                  <div className={`w-6 h-6 rounded-full ${chat.color} shrink-0 flex items-center justify-center`}>
                    <span className="text-[10px] font-bold text-white">{chat.name[0]}</span>
                  </div>
                  <div>
                    <span className="font-body text-[10px] font-bold text-white/60">{chat.name}</span>
                    <p className="font-body text-xs text-white/90">{chat.msg}</p>
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