// 50+ languages supported by Qadrdaan UI
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region?: string;
  rtl?: boolean;
}

export const LANGUAGES: Language[] = [
  // South Asian (priority)
  { code: "ur-PK", name: "Urdu (Pakistan)", nativeName: "اردو", region: "Pakistan", rtl: true },
  { code: "ur-IN", name: "Urdu (India)", nativeName: "اردو", region: "India", rtl: true },
  { code: "pa-PK", name: "Punjabi (Pakistan)", nativeName: "پنجابی (شاہمکھی)", region: "Pakistan", rtl: true },
  { code: "pa-IN", name: "Punjabi (Gurmukhi)", nativeName: "ਪੰਜਾਬੀ", region: "India" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "India" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", rtl: true },
  { code: "ps", name: "Pashto", nativeName: "پښتو", rtl: true },
  { code: "bal", name: "Balochi", nativeName: "بلۏچی", rtl: true },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "ks", name: "Kashmiri", nativeName: "کٲشُر", rtl: true },

  // Middle East / Persian / Turkic
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  { code: "fa", name: "Persian (Farsi)", nativeName: "فارسی", rtl: true },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan" },
  { code: "ku", name: "Kurdish", nativeName: "Kurdî" },
  { code: "he", name: "Hebrew", nativeName: "עברית", rtl: true },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbek" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақ" },

  // Western
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },

  // East / SE Asia
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "tl", name: "Filipino", nativeName: "Filipino" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာ" },

  // African
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "ha", name: "Hausa", nativeName: "Hausa" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
];

export const FEELINGS = [
  { emoji: "😊", label: "happy" },
  { emoji: "😢", label: "sad" },
  { emoji: "❤️", label: "in love" },
  { emoji: "😍", label: "blessed" },
  { emoji: "😌", label: "peaceful" },
  { emoji: "🥺", label: "emotional" },
  { emoji: "🤔", label: "thoughtful" },
  { emoji: "😤", label: "passionate" },
  { emoji: "🌙", label: "nostalgic" },
  { emoji: "🌹", label: "romantic" },
  { emoji: "🕊️", label: "hopeful" },
  { emoji: "🔥", label: "inspired" },
  { emoji: "😴", label: "tired" },
  { emoji: "🥰", label: "grateful" },
  { emoji: "😔", label: "heartbroken" },
];
