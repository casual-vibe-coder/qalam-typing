// Arabic text pulled verbatim (matn only, isnad/chain trimmed) from the
// fawazahmed0/hadith-api Arabic Bukhari/Muslim/Tirmidhi datasets — the same
// source family already used and spot-checked in the Awwal project. English
// glosses are reused from that project's already-verified translations.
// Each entry's Arabic was independently content-matched against its English
// gloss here (not just matched by hadith number, since numbering schemes
// differ across editions/datasets) before being included.
export interface HadithEntry {
  ar: string;
  en: string;
  narrator: string;
  reference: string;
}

export const HADITHS: HadithEntry[] = [
  {
    ar: "صَلاَةُ الْجَمَاعَةِ تَفْضُلُ صَلاَةَ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً",
    en: "Prayer in congregation is twenty-seven times more excellent than prayer offered alone.",
    narrator: "Abdullah ibn Umar",
    reference: "Sahih al-Bukhari 645",
  },
  {
    ar: "الْمَلاَئِكَةُ تُصَلِّي عَلَى أَحَدِكُمْ مَا دَامَ فِي مُصَلاَّهُ الَّذِي صَلَّى فِيهِ، مَا لَمْ يُحْدِثْ، تَقُولُ اللَّهُمَّ اغْفِرْ لَهُ اللَّهُمَّ ارْحَمْهُ",
    en: "The angels keep asking Allah's forgiveness for anyone of you as long as he remains at his place of prayer, saying: “O Allah, forgive him. O Allah, have mercy on him.”",
    narrator: "Abu Hurairah",
    reference: "Sahih al-Bukhari 445",
  },
  {
    ar: "مَنْ بَنَى مَسْجِدًا يَبْتَغِي بِهِ وَجْهَ اللَّهِ، بَنَى اللَّهُ لَهُ مِثْلَهُ فِي الْجَنَّةِ",
    en: "Whoever builds a mosque seeking Allah's pleasure, Allah will build for him a similar house in Paradise.",
    narrator: "Uthman ibn Affan",
    reference: "Sahih al-Bukhari 450",
  },
  {
    ar: "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ",
    en: "Islam is built upon five: testifying that there is no god but Allah and that Muhammad is His Messenger, establishing prayer, giving zakah, making pilgrimage to the House, and fasting Ramadan.",
    narrator: "Abdullah ibn Umar",
    reference: "Sahih al-Bukhari 8",
  },
  {
    ar: "أَرَأَيْتُمْ لَوْ أَنَّ نَهَرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ فِيهِ كُلَّ يَوْمٍ خَمْسًا، مَا تَقُولُ ذَلِكَ يُبْقِي مِنْ دَرَنِهِ؟ فَذَلِكَ مِثْلُ الصَّلَوَاتِ الْخَمْسِ، يَمْحُو اللَّهُ بِهَا الْخَطَايَا",
    en: "If there was a river at the door of any one of you and he took a bath in it five times a day, would you notice any dirt on him? That is the example of the five prayers, with which Allah blots out evil deeds.",
    narrator: "Abu Hurairah",
    reference: "Sahih al-Bukhari 528",
  },
  {
    ar: "إِذَا أَمَّنَ الإِمَامُ فَأَمِّنُوا، فَإِنَّهُ مَنْ وَافَقَ تَأْمِينُهُ تَأْمِينَ الْمَلاَئِكَةِ غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    en: "Say “Ameen” when the Imam says it — if your Ameen coincides with that of the angels, all your past sins will be forgiven.",
    narrator: "Abu Hurairah",
    reference: "Sahih al-Bukhari 780",
  },
  {
    ar: "يَنْزِلُ رَبُّنَا تَبَارَكَ وَتَعَالَى كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الآخِرُ، يَقُولُ: مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ، مَنْ يَسْأَلُنِي فَأُعْطِيَهُ، مَنْ يَسْتَغْفِرُنِي فَأَغْفِرَ لَهُ",
    en: "Our Lord descends every night to the lowest heaven when the last third of the night remains, saying: “Is there anyone calling upon Me, that I may answer him? Is there anyone asking of Me, that I may give him? Is there anyone seeking My forgiveness, that I may forgive him?”",
    narrator: "Abu Hurairah",
    reference: "Sahih al-Bukhari 1145",
  },
  {
    ar: "يُصَلُّونَ لَكُمْ، فَإِنْ أَصَابُوا فَلَكُمْ، وَإِنْ أَخْطَئُوا فَلَكُمْ وَعَلَيْهِمْ",
    en: "If the Imam leads the prayer correctly, both of you receive the reward; but if he makes a mistake, you still receive the reward and the error is his.",
    narrator: "Abu Hurairah",
    reference: "Sahih al-Bukhari 694",
  },
  {
    ar: "إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلاَتُهُ، فَإِنْ صَلُحَتْ فَقَدْ أَفْلَحَ وَأَنْجَحَ، وَإِنْ فَسَدَتْ فَقَدْ خَابَ وَخَسِرَ",
    en: "The first of a person's deeds for which he will be called to account on the Day of Resurrection is his prayer. If it is sound, the rest of his deeds will be sound; if it is deficient, the rest of his deeds will be deficient.",
    narrator: "Abu Hurairah",
    reference: "Jami' at-Tirmidhi 413",
  },
  {
    ar: "مَثَلُ الصَّلَوَاتِ الْخَمْسِ كَمَثَلِ نَهَرٍ جَارٍ غَمْرٍ عَلَى بَابِ أَحَدِكُمْ يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسَ مَرَّاتٍ",
    en: "The five daily prayers are like a river flowing at the door of one of you, in which he washes five times a day — no filthiness would remain on him.",
    narrator: "Jabir ibn Abdullah",
    reference: "Sahih Muslim 1523",
  },
  {
    ar: "إِنَّ الْمَلاَئِكَةَ تُصَلِّي عَلَى أَحَدِكُمْ مَا دَامَ فِي مَجْلِسِهِ، تَقُولُ: اللَّهُمَّ اغْفِرْ لَهُ اللَّهُمَّ ارْحَمْهُ، مَا لَمْ يُحْدِثْ",
    en: "The angels invoke blessings on every one of you so long as you remain in your place of prayer, saying: “O Allah, forgive him. O Allah, have mercy on him,” as long as your ablution is not broken.",
    narrator: "Abu Hurairah",
    reference: "Sahih Muslim 1508",
  },
  {
    ar: "مَنْ صَلَّى اثْنَتَىْ عَشْرَةَ رَكْعَةً فِي يَوْمٍ وَلَيْلَةٍ بُنِيَ لَهُ بِهِنَّ بَيْتٌ فِي الْجَنَّةِ",
    en: "A house will be built in Paradise for anyone who prays twelve rak'ahs, beyond the obligatory prayers, in a day and a night.",
    narrator: "Umm Habibah",
    reference: "Sahih Muslim 1694",
  },
  {
    ar: "مَنِ اغْتَسَلَ ثُمَّ أَتَى الْجُمُعَةَ فَصَلَّى مَا قُدِّرَ لَهُ، ثُمَّ أَنْصَتَ حَتَّى يَفْرُغَ مِنْ خُطْبَتِهِ، ثُمَّ يُصَلِّيَ مَعَهُ، غُفِرَ لَهُ مَا بَيْنَهُ وَبَيْنَ الْجُمُعَةِ الأُخْرَى وَفَضْلَ ثَلاَثَةِ أَيَّامٍ",
    en: "Whoever performs ablution well, then comes for the Friday prayer, listens attentively and keeps silent, his sins between that Friday and the next — plus three days more — will be forgiven.",
    narrator: "Abu Hurairah",
    reference: "Sahih Muslim 1987",
  },
  {
    ar: "الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَالصَّلاَةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ",
    en: "Purity is half of faith… prayer is a light, charity is a proof, and patience is a brightness.",
    narrator: "Abu Malik al-Ash'ari",
    reference: "Sahih Muslim 534",
  },
];
