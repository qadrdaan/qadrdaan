import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { Sparkles, Languages, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { LANGUAGES } from "@/lib/languages";
import { toast } from "sonner";

const VerseOfTheDay = () => {
  const { lang } = useLanguage();
  const [verse, setVerse] = useState<any>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [pickedLang, setPickedLang] = useState<string>(lang);

  useEffect(() => { setPickedLang(lang); }, [lang]);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("verse_of_the_day")
        .select("*")
        .lte("display_date", today)
        .order("display_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      setVerse(data);
    })();
  }, []);

  if (!verse) return null;

  const baseCode = pickedLang.split("-")[0];
  const translations = (verse.translations as Record<string, string>) || {};
  const translation =
    translations[pickedLang] ||
    translations[baseCode] ||
    translations[Object.keys(translations).find(k => k.startsWith(baseCode)) || ""] ||
    null;

  const handleShare = async () => {
    const text = `"${verse.content}" — ${verse.author || "Anonymous"}\n\nVerse of the Day · Qadrdaan`;
    if (navigator.share) {
      try { await navigator.share({ title: "Verse of the Day", text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Verse copied");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-border rounded-2xl p-5 mb-6 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-secondary" />
        <h3 className="font-display text-xs font-bold uppercase tracking-widest text-secondary">Verse of the Day</h3>
      </div>
      <p className="font-display text-lg md:text-xl text-foreground whitespace-pre-line leading-relaxed">
        {verse.content}
      </p>
      {verse.author && (
        <p className="font-body text-xs text-muted-foreground mt-2">— {verse.author}</p>
      )}

      {showTranslation && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-3.5 h-3.5 text-primary" />
            <select
              value={pickedLang}
              onChange={(e) => setPickedLang(e.target.value)}
              className="bg-muted text-xs font-body rounded px-2 py-1 border-none focus:outline-none"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
              ))}
            </select>
          </div>
          {translation ? (
            <p className="font-body text-sm text-foreground/90 italic whitespace-pre-line">{translation}</p>
          ) : (
            <p className="font-body text-xs text-muted-foreground italic">Translation not yet available for this language.</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary/20 transition-colors"
        >
          <Languages className="w-3.5 h-3.5" /> {showTranslation ? "Hide" : "Translate"}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-full text-xs font-bold hover:bg-muted/80 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </motion.div>
  );
};

export default VerseOfTheDay;
