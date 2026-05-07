import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { LANGUAGES } from "@/lib/languages";

type LanguageContextType = {
  lang: string;
  setLang: (code: string) => void;
  current: typeof LANGUAGES[number];
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  current: LANGUAGES.find(l => l.code === "en")!,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<string>(() => localStorage.getItem("qd_lang") || "en");

  useEffect(() => {
    const cur = LANGUAGES.find(l => l.code === lang) || LANGUAGES.find(l => l.code === "en")!;
    document.documentElement.lang = lang.split("-")[0];
    document.documentElement.dir = cur.rtl ? "rtl" : "ltr";
    localStorage.setItem("qd_lang", lang);
  }, [lang]);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES.find(l => l.code === "en")!;

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, current }}>
      {children}
    </LanguageContext.Provider>
  );
};
