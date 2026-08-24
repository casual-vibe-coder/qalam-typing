// Arabic text (standard/"simple" orthography, not Uthmani mushaf rasm —
// deliberately, since Uthmani script uses glyphs like the small superscript
// alef that aren't reachable on a standard keyboard) and Sahih International
// translation, both pulled from the Al Quran Cloud API and cross-checked.
export interface Ayah {
  ar: string;
  en: string;
  n: number;
}

export interface Surah {
  id: string;
  name: string;
  arabicName: string;
  ayahs: Ayah[];
}

export const SURAHS: Surah[] = [
  {
    id: "ikhlas",
    name: "Al-Ikhlas — Sincerity",
    arabicName: "الإخلاص",
    ayahs: [
      { n: 1, ar: "قُلْ هُوَ اللَّهُ أَحَدٌ", en: 'Say, "He is Allah, [who is] One,' },
      { n: 2, ar: "اللَّهُ الصَّمَدُ", en: "Allah, the Eternal Refuge." },
      { n: 3, ar: "لَمْ يَلِدْ وَلَمْ يُولَدْ", en: "He neither begets nor is born," },
      { n: 4, ar: "وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", en: 'Nor is there to Him any equivalent."' },
    ],
  },
  {
    id: "asr",
    name: "Al-Asr — The Declining Day",
    arabicName: "العصر",
    ayahs: [
      { n: 1, ar: "وَالْعَصْرِ", en: "By time," },
      { n: 2, ar: "إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ", en: "Indeed, mankind is in loss," },
      {
        n: 3,
        ar: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
        en: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
      },
    ],
  },
  {
    id: "fatiha",
    name: "Al-Fatiha — The Opening",
    arabicName: "الفاتحة",
    ayahs: [
      { n: 1, ar: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", en: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
      { n: 2, ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", en: "[All] praise is [due] to Allah, Lord of the worlds -" },
      { n: 3, ar: "الرَّحْمَنِ الرَّحِيمِ", en: "The Entirely Merciful, the Especially Merciful," },
      { n: 4, ar: "مَالِكِ يَوْمِ الدِّينِ", en: "Sovereign of the Day of Recompense." },
      { n: 5, ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", en: "It is You we worship and You we ask for help." },
      { n: 6, ar: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", en: "Guide us to the straight path -" },
      {
        n: 7,
        ar: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        en: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
      },
    ],
  },
  {
    id: "nas",
    name: "An-Nas — Mankind",
    arabicName: "الناس",
    ayahs: [
      { n: 1, ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", en: 'Say, "I seek refuge in the Lord of mankind,' },
      { n: 2, ar: "مَلِكِ النَّاسِ", en: "The Sovereign of mankind." },
      { n: 3, ar: "إِلَهِ النَّاسِ", en: "The God of mankind," },
      { n: 4, ar: "مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", en: "From the evil of the retreating whisperer -" },
      { n: 5, ar: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", en: "Who whispers [evil] into the breasts of mankind -" },
      { n: 6, ar: "مِنَ الْجِنَّةِ وَالنَّاسِ", en: 'From among the jinn and mankind."' },
    ],
  },
];
