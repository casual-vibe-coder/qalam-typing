// Letter names + plain-English sound hints for every glyph taught in the
// course — standard Arabic letter names, not invented. Used to actually
// TEACH each new letter before drilling it, instead of assuming the
// student already knows Arabic script.
export interface GlyphInfo {
  name: string;
  sound: string;
}

export const GLYPH_INFO: Record<string, GlyphInfo> = {
  // Core alphabet
  ا: { name: "Alif", sound: "a long \"aa\" (or a glottal stop at the start of a word)" },
  ب: { name: "Baa", sound: "English \"b\"" },
  ت: { name: "Taa", sound: "English \"t\"" },
  ث: { name: "Thaa", sound: "\"th\" in \"think\"" },
  ج: { name: "Jeem", sound: "English \"j\"" },
  ح: { name: "Haa", sound: "a breathy \"h\", from the throat" },
  خ: { name: "Khaa", sound: "\"ch\" in Scottish \"loch\"" },
  د: { name: "Daal", sound: "English \"d\"" },
  ذ: { name: "Dhaal", sound: "\"th\" in \"this\"" },
  ر: { name: "Raa", sound: "a rolled/tapped \"r\"" },
  ز: { name: "Zaay", sound: "English \"z\"" },
  س: { name: "Seen", sound: "English \"s\"" },
  ش: { name: "Sheen", sound: "English \"sh\"" },
  ص: { name: "Saad", sound: "a heavy, emphatic \"s\"" },
  ض: { name: "Daad", sound: "a heavy, emphatic \"d\"" },
  ط: { name: "Taa", sound: "a heavy, emphatic \"t\"" },
  ظ: { name: "Zaa", sound: "a heavy, emphatic \"th\"/\"z\"" },
  ع: { name: "Ayn", sound: "a tight throat sound with no English equivalent" },
  غ: { name: "Ghayn", sound: "the French \"r\" — a soft gargle" },
  ف: { name: "Faa", sound: "English \"f\"" },
  ق: { name: "Qaf", sound: "a deep \"k\", from the back of the throat" },
  ك: { name: "Kaf", sound: "English \"k\"" },
  ل: { name: "Laam", sound: "English \"l\"" },
  م: { name: "Meem", sound: "English \"m\"" },
  ن: { name: "Noon", sound: "English \"n\"" },
  ه: { name: "Haa", sound: "a soft \"h\", same as English \"h\"" },
  و: { name: "Waw", sound: "English \"w\" (or a long \"oo\")" },
  ي: { name: "Yaa", sound: "English \"y\" (or a long \"ee\")" },

  // Hamza seats & related glyphs
  ة: { name: "Taa marbuta", sound: "a soft \"a/ah\" — sits at the end of (usually feminine) words" },
  ى: { name: "Alif maksura", sound: "a long \"aa\", written like a dotless yaa at the end of a word" },
  ء: { name: "Hamza", sound: "a glottal stop — the catch in \"uh-oh\"" },
  أ: { name: "Alif with hamza above", sound: "a glottal stop + \"a\"" },
  إ: { name: "Alif with hamza below", sound: "a glottal stop + \"i\"" },
  آ: { name: "Alif with madda", sound: "a glottal stop + long \"aa\"" },
  ؤ: { name: "Waw with hamza", sound: "a glottal stop + \"w/oo\"" },
  ئ: { name: "Yaa with hamza", sound: "a glottal stop + \"y/ee\"" },

  // Harakat (diacritics) — quoted keys since a bare combining mark isn't a valid object-key token
  "َ": { name: "Fathah", sound: "a short \"a\", sits above the letter" },
  "ِ": { name: "Kasrah", sound: "a short \"i\", sits below the letter" },
  "ُ": { name: "Dammah", sound: "a short \"u\", sits above the letter" },
  "ً": { name: "Tanween fath", sound: "an \"-an\" sound at the end of a word" },
  "ٍ": { name: "Tanween kasr", sound: "an \"-in\" sound at the end of a word" },
  "ٌ": { name: "Tanween damm", sound: "an \"-un\" sound at the end of a word" },
  "ْ": { name: "Sukoon", sound: "means \"no vowel\" follows this letter" },
  "ّ": { name: "Shaddah", sound: "doubles the consonant it sits on" },
};
