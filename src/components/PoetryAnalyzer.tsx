import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface AnalysisResult {
  bahr: { name: string; confidence: string; description: string };
  auzaan: { pattern: string; breakdown: string[] };
  qafiya: { rhyme_scheme: string; rhyme_words: string[]; errors: string[] };
  radif: { present: boolean; word: string; consistency: string };
  rhythm_score: number;
  errors: { type: string; line?: number; message: string }[];
  suggestions: string[];
  overall_quality: string;
}

interface Props {
  content: string;
  language: string;
  category: string;
}

const qualityColors: Record<string, string> = {
  excellent: "text-green-600",
  good: "text-primary",
  fair: "text-secondary",
  needs_improvement: "text-destructive",
};

const PoetryAnalyzer = ({ content, language, category }: Props) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-poetry", {
        body: { content, language, category },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (e: any) {
      setError(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={analysis ? () => setExpanded(!expanded) : analyze}
        disabled={loading || !content.trim()}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
      >
        <span className="font-body text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-secondary" />
          AI Poetry Analyzer — Bahr, Auzaan, Qafiya, Radif
        </span>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : analysis ? (
          expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        ) : (
          <span className="text-xs font-body text-primary font-semibold">Analyze</span>
        )}
      </button>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <p className="px-4 py-2 font-body text-sm text-destructive bg-destructive/10">{error}</p>
          </motion.div>
        )}

        {analysis && expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-4 bg-card">
              {/* Quality & Score */}
              <div className="flex items-center justify-between">
                <span className={`font-display text-lg font-bold capitalize ${qualityColors[analysis.overall_quality] || "text-foreground"}`}>
                  {analysis.overall_quality.replace(/_/g, " ")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs text-muted-foreground">Rhythm</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${analysis.rhythm_score * 10}%` }} />
                  </div>
                  <span className="font-body text-xs font-bold text-foreground">{analysis.rhythm_score}/10</span>
                </div>
              </div>

              {/* Bahr */}
              <div className="p-3 bg-background rounded-lg border border-border">
                <h4 className="font-body text-xs font-semibold text-muted-foreground mb-1">بحر (Bahr / Meter)</h4>
                <p className="font-body text-sm font-medium text-foreground">{analysis.bahr.name}</p>
                <p className="font-body text-xs text-muted-foreground">{analysis.bahr.description}</p>
                <span className={`inline-block mt-1 text-xs font-body px-2 py-0.5 rounded-full ${analysis.bahr.confidence === "high" ? "bg-green-100 text-green-700" : "bg-secondary/20 text-secondary"}`}>
                  {analysis.bahr.confidence} confidence
                </span>
              </div>

              {/* Auzaan */}
              <div className="p-3 bg-background rounded-lg border border-border">
                <h4 className="font-body text-xs font-semibold text-muted-foreground mb-1">اوزان (Auzaan / Feet)</h4>
                <p className="font-body text-sm font-mono text-foreground">{analysis.auzaan.pattern}</p>
                {analysis.auzaan.breakdown.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {analysis.auzaan.breakdown.slice(0, 4).map((line, i) => (
                      <p key={i} className="font-body text-xs text-muted-foreground">Line {i + 1}: {line}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Qafiya & Radif */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background rounded-lg border border-border">
                  <h4 className="font-body text-xs font-semibold text-muted-foreground mb-1">قافیہ (Qafiya)</h4>
                  <p className="font-body text-sm text-foreground">{analysis.qafiya.rhyme_scheme}</p>
                  {analysis.qafiya.rhyme_words.length > 0 && (
                    <p className="font-body text-xs text-muted-foreground mt-1">{analysis.qafiya.rhyme_words.join(", ")}</p>
                  )}
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <h4 className="font-body text-xs font-semibold text-muted-foreground mb-1">ردیف (Radif)</h4>
                  {analysis.radif.present ? (
                    <>
                      <p className="font-body text-sm text-foreground">{analysis.radif.word}</p>
                      <p className="font-body text-xs text-muted-foreground capitalize">{analysis.radif.consistency}</p>
                    </>
                  ) : (
                    <p className="font-body text-xs text-muted-foreground">Not present</p>
                  )}
                </div>
              </div>

              {/* Errors */}
              {analysis.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-body text-xs font-semibold text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Issues Found
                  </h4>
                  {analysis.errors.map((err, i) => (
                    <div key={i} className="px-3 py-2 bg-destructive/5 rounded-lg border border-destructive/20">
                      <p className="font-body text-xs text-foreground">
                        <span className="font-semibold capitalize">{err.type}</span>
                        {err.line && <span className="text-muted-foreground"> (Line {err.line})</span>}
                        : {err.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-body text-xs font-semibold text-primary flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Suggestions
                  </h4>
                  {analysis.suggestions.map((s, i) => (
                    <p key={i} className="font-body text-xs text-foreground pl-4 border-l-2 border-primary/30">{s}</p>
                  ))}
                </div>
              )}

              {/* Re-analyze */}
              <button
                type="button"
                onClick={analyze}
                disabled={loading}
                className="text-xs font-body font-semibold text-primary hover:underline"
              >
                {loading ? "Analyzing..." : "Re-analyze"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PoetryAnalyzer;
