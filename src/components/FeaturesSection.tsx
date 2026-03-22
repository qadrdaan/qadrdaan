import { motion } from "framer-motion";
import { BookOpen, Mic, Gift, Video, Users, Trophy } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Publish & Sell Books",
    description: "Upload your poetry collections in PDF or ePub. Set your price, add previews, and reach readers globally.",
  },
  {
    icon: Video,
    title: "Video Performances",
    description: "Share poetry recitations, lectures, and literary discussions with a built-in streaming player.",
  },
  {
    icon: Mic,
    title: "Live Mushaira",
    description: "Join live digital poetry gatherings with real-time audience reactions, voting, and gifts.",
  },
  {
    icon: Gift,
    title: "Fan Support & Gifts",
    description: "Receive direct financial support from admirers through appreciation gifts and premium donations.",
  },
  {
    icon: Users,
    title: "Creator Profiles",
    description: "Build your literary identity with a rich profile, personal store, followers, and verification badge.",
  },
  {
    icon: Trophy,
    title: "Competitions & Awards",
    description: "Compete in global poetry contests. Win digital trophies, badges, and featured homepage placement.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => (
  <section id="features" className="py-24 bg-background">
    <div className="container mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-body text-sm tracking-[0.2em] uppercase text-secondary mb-3">Platform Features</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
          Everything a Poet <span className="text-gradient-brand">Needs</span>
        </h2>
        <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
          From publishing to performing, qadrdaan gives creators every tool to share their art with the world.
        </p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={item}
            className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-brand"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
            <p className="font-body text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default FeaturesSection;