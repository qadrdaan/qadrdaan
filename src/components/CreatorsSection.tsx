import { motion } from "framer-motion";
import { Star, BookOpen, Users, BadgeCheck } from "lucide-react";

const poets = [
  { name: "Faiz Ahmad", language: "Urdu", books: 12, followers: "45K", verified: true },
  { name: "Anya Sharma", language: "Hindi", books: 8, followers: "32K", verified: true },
  { name: "Omar Al-Rashid", language: "Arabic", books: 15, followers: "61K", verified: true },
  { name: "Elena Vasquez", language: "English", books: 6, followers: "28K", verified: false },
];

const CreatorsSection = () => (
  <section id="creators" className="py-24 bg-card">
    <div className="container mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="font-body text-sm tracking-[0.2em] uppercase text-secondary mb-3">Featured Poets</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
          Rising <span className="text-gradient-gold">Voices</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {poets.map((poet, i) => (
          <motion.div
            key={poet.name}
            className="group relative p-6 rounded-2xl bg-background border border-border hover:border-gold/30 transition-all duration-300 hover:shadow-gold text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Avatar placeholder */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="font-display text-2xl font-bold text-primary">{poet.name[0]}</span>
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h3 className="font-display text-lg font-semibold text-foreground">{poet.name}</h3>
              {poet.verified && <BadgeCheck className="w-4 h-4 text-secondary" />}
            </div>
            <p className="font-body text-sm text-muted-foreground mb-4">{poet.language}</p>

            <div className="flex items-center justify-center gap-4 text-sm font-body text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{poet.books}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{poet.followers}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CreatorsSection;
