import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp } from "lucide-react";

export type ReactionType = "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry";

// Facebook-style emoji reactions
export const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: "like",  emoji: "👍", label: "Like",  color: "text-blue-500" },
  { type: "love",  emoji: "❤️", label: "Love",  color: "text-rose-500" },
  { type: "care",  emoji: "🥰", label: "Care",  color: "text-amber-500" },
  { type: "haha",  emoji: "😂", label: "Haha",  color: "text-yellow-500" },
  { type: "wow",   emoji: "😮", label: "Wow",   color: "text-yellow-500" },
  { type: "sad",   emoji: "😢", label: "Sad",   color: "text-purple-500" },
  { type: "angry", emoji: "😡", label: "Angry", color: "text-red-600" },
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

  const current = REACTIONS.find(r => r.type === active);

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      <button
        onClick={() => onReact(active ? null : "like")}
        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
          active ? current?.color : "text-muted-foreground hover:text-blue-500"
        }`}
      >
        {current ? (
          <span className="text-base leading-none">{current.emoji}</span>
        ) : (
          <ThumbsUp className="w-4 h-4" />
        )}
        <span>{current?.label || "Like"}</span>
        {count > 0 && <span className="text-muted-foreground font-medium">· {count}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 flex items-center gap-0.5 px-2 py-1.5 bg-card border border-border rounded-full shadow-xl z-50"
          >
            {REACTIONS.map(r => (
              <button
                key={r.type}
                onClick={() => { onReact(r.type); setOpen(false); }}
                title={r.label}
                className="text-2xl p-1 rounded-full hover:scale-150 transition-transform duration-150 leading-none"
              >
                {r.emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReactionPicker;
