import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ThumbsUp, HandHeart, Frown, Angry } from "lucide-react";

export type ReactionType = "heart" | "thumbsup" | "care" | "sad" | "angry";

export const REACTIONS: { type: ReactionType; icon: any; label: string; color: string }[] = [
  { type: "heart",    icon: Heart,     label: "Love",   color: "text-rose-500" },
  { type: "thumbsup", icon: ThumbsUp,  label: "Like",   color: "text-blue-500" },
  { type: "care",     icon: HandHeart, label: "Care",   color: "text-amber-500" },
  { type: "sad",      icon: Frown,     label: "Sad",    color: "text-purple-500" },
  { type: "angry",    icon: Angry,     label: "Angry",  color: "text-red-600" },
];

interface ReactionPickerProps {
  active: ReactionType | null;
  count: number;
  onReact: (type: ReactionType | null) => void;
}

const ReactionPicker = ({ active, count, onReact }: ReactionPickerProps) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<any>(null);

  const show = () => { clearTimeout(timer.current); setOpen(true); };
  const hide = () => { timer.current = setTimeout(() => setOpen(false), 250); };

  const current = REACTIONS.find(r => r.type === active) || REACTIONS[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      <button
        onClick={() => onReact(active ? null : "heart")}
        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
          active ? current.color : "text-muted-foreground hover:text-rose-500"
        }`}
      >
        <CurrentIcon className={`w-4 h-4 ${active ? "fill-current" : ""}`} />
        {count}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 flex items-center gap-1 px-2 py-1.5 bg-card border border-border rounded-full shadow-xl z-50"
          >
            {REACTIONS.map(r => {
              const Icon = r.icon;
              return (
                <button
                  key={r.type}
                  onClick={() => { onReact(r.type); setOpen(false); }}
                  title={r.label}
                  className={`p-1.5 rounded-full hover:scale-125 transition-transform ${r.color}`}
                >
                  <Icon className="w-5 h-5 fill-current" />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReactionPicker;
