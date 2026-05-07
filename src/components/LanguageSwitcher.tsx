import { useState } from "react";
import { Globe, Check, Search } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";
import { useLanguage } from "@/hooks/useLanguage";

const LanguageSwitcher = ({ inline = false }: { inline?: boolean }) => {
  const { lang, setLang, current } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(query.toLowerCase()) ||
      (l.region || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 ${
          inline
            ? "w-full px-4 py-2.5 text-sm hover:bg-muted text-foreground font-body"
            : "px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-body font-medium text-foreground"
        }`}
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="flex-1 text-left truncate">
          {current.nativeName}
          {current.region ? <span className="text-muted-foreground"> · {current.region}</span> : null}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 max-h-96 overflow-hidden bg-card border border-border rounded-xl shadow-xl z-50 flex flex-col">
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-muted rounded-lg">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 50+ languages..."
                className="flex-1 bg-transparent text-xs font-body focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); setQuery(""); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors"
              >
                <span className="text-xs text-muted-foreground w-12 font-mono">{l.code}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-foreground truncate">{l.nativeName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{l.name}</p>
                </div>
                {lang === l.code && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
