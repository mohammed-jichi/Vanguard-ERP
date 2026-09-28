/**
 * Vanguard ERP — Master Lebanese Cities Directory & Worldwide Countries
 * Complete paired list of Lebanese cities, towns, and municipalities
 * paired with their Caza (District) and Mohafazah (Governorate).
 */

export interface LebaneseCity {
  id: string;
  name: string;
  caza: string;
  governorate: string;
  nameAr?: string;
}

import {
  ALL_WORLD_COUNTRIES,
  ALL_COUNTRY_DIAL_CODES,
  ALL_WORLD_COUNTRIES_INFO,
  CountryInfo,
} from './countriesData';

export {
  ALL_WORLD_COUNTRIES,
  ALL_COUNTRY_DIAL_CODES,
  ALL_WORLD_COUNTRIES_INFO,
  type CountryInfo,
};

export const WORLD_COUNTRIES = ALL_WORLD_COUNTRIES;


export const LEBANESE_CITIES: LebaneseCity[] = [
  // EL KOURA CAZA (NORTH LEBANON)
  { id: 'aaba-koura', name: 'Aaba', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'عابا' },
  { id: 'amioun-koura', name: 'Amioun', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'أميون' },
  { id: 'kousba-koura', name: 'Kousba', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'كوسبا' },
  { id: 'kfarsaroun-koura', name: 'Kfarsaroun', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'كفرصارون' },
  { id: 'deddeh-koura', name: 'Deddeh', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'دده' },
  { id: 'enfeh-koura', name: 'Enfeh', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'أنفه' },
  { id: 'bkeftine-koura', name: 'Bkeftine', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'بكفتين' },
  { id: 'barsa-koura', name: 'Barsa', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'برسا' },
  { id: 'ras-maska-koura', name: 'Ras Maska', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'رأس مسقا' },
  { id: 'afsaddiq-koura', name: 'Afsaddiq', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'عفصديق' },
  { id: 'bchezzine-koura', name: 'Bchezzine', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'بطوراتج / بزيزا' },
  { id: 'anfeh-al-koura', name: 'Al-Hraiche', caza: 'El Koura', governorate: 'North Lebanon', nameAr: 'الهريشه' },

  // BAABDA CAZA (MOUNT LEBANON)
  { id: 'aabadiye-baabda', name: 'Aabadiye', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'العبادية' },
  { id: 'baabda-city', name: 'Baabda', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'بعبدا' },
  { id: 'hadath-baabda', name: 'Hadath', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'الحدث' },
  { id: 'hazmieh-baabda', name: 'Hazmieh', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'الحازمية' },
  { id: 'furn-el-chebbak-baabda', name: 'Furn El Chebbak', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'فرن الشباك' },
  { id: 'chiyah-baabda', name: 'Chiyah', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'الشياح' },
  { id: 'haret-hreik-baabda', name: 'Haret Hreik', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'حارة حريك' },
  { id: 'ghobeiry-baabda', name: 'Ghobeiry', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'الغبيري' },
  { id: 'kfarchima-baabda', name: 'Kfarchima', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'كفرشيما' },
  { id: 'yarze-baabda', name: 'Yarze', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'اليرزة' },
  { id: 'jamhour-baabda', name: 'Jamhour', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'الجمهور' },
  { id: 'louaizeh-baabda', name: 'Louaizeh', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'اللويزة' },
  { id: 'hammana-baabda', name: 'Hammana', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'حمانا' },
  { id: 'qornayel-baabda', name: 'Qornayel', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'قرنايل' },
  { id: 'falougha-baabda', name: 'Falougha', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'فالوغا' },
  { id: 'ras-el-matn-baabda', name: 'Ras El Matn', caza: 'Baabda', governorate: 'Mount Lebanon', nameAr: 'رأس المتن' },

  // ALEY CAZA (MOUNT LEBANON)
  { id: 'aamroussieh-choueifat', name: 'Aamroussieh Choueifat', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'العمروسية الشويفات' },
  { id: 'choueifat-central', name: 'Choueifat (معمل الشويفات)', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'الشويفات - المعمل المركزي' },
  { id: 'choueifat-omara', name: 'Choueifat Al-Omara', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'الشويفات الأمراء' },
  { id: 'choueifat-qubbeh', name: 'Choueifat Al-Qubbeh', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'الشويفات القبة' },
  { id: 'aley-city', name: 'Aley', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'عاليه' },
  { id: 'bhamdoun-aley', name: 'Bhamdoun', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'بحمدون' },
  { id: 'khaldeh-aley', name: 'Khaldeh', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'خلدة' },
  { id: 'aramoun-aley', name: 'Aramoun', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'عرمون' },
  { id: 'bchamoun-aley', name: 'Bchamoun', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'بشامون' },
  { id: 'ain-aanoub-aley', name: 'Ain Aanoub', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'عين عنوب' },
  { id: 'ainab-aley', name: 'Ainab', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'عيناب' },
  { id: 'souk-el-gharb-aley', name: 'Souk El Gharb', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'سوق الغرب' },
  { id: 'mansourieh-bhamdoun-aley', name: 'Mansourieh Bhamdoun', caza: 'Aley', governorate: 'Mount Lebanon', nameAr: 'منصورية بحمدون' },

  // BEIRUT GOVERNORATE
  { id: 'beirut-central', name: 'Beirut (Central / Downtown)', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت (وسط المدينة)' },
  { id: 'beirut-hamra', name: 'Beirut - Hamra', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - الحمرا' },
  { id: 'beirut-achrafieh', name: 'Beirut - Achrafieh', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - الأشرفية' },
  { id: 'beirut-verdun', name: 'Beirut - Verdun', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - فردان' },
  { id: 'beirut-mar-mikhael', name: 'Beirut - Mar Mikhael', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - مار مخايل' },
  { id: 'beirut-gemmayzeh', name: 'Beirut - Gemmayzeh', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - الجميزة' },
  { id: 'beirut-badaro', name: 'Beirut - Badaro', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - بدارو' },
  { id: 'beirut-ras-beirut', name: 'Beirut - Ras Beirut', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - رأس بيروت' },
  { id: 'beirut-msaytbeh', name: 'Beirut - Msaytbeh', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - المصيطبة' },
  { id: 'beirut-mazraa', name: 'Beirut - Mazraa', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - المزرعة' },
  { id: 'beirut-bachoura', name: 'Beirut - Bachoura', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - الباشورة' },
  { id: 'beirut-ain-el-mreisseh', name: 'Beirut - Ain El Mreisseh', caza: 'Beirut', governorate: 'Beirut', nameAr: 'بيروت - عين المريسة' },

  // SOUTH LEBANON - SOUR (TYRE) CAZA
  { id: 'sour-city', name: 'Sour (Tyre)', caza: 'Sour', governorate: 'South Lebanon', nameAr: 'صور' },
  { id: 'qana-sour', name: 'Qana', caza: 'Sour', governorate: 'South Lebanon', nameAr: 'قانا' },
  { id: 'abbasiyeh-sour', name: 'Abbasiyeh', caza: 'Sour', governorate: 'South Lebanon', nameAr: 'العباسية' },
  { id: 'jouaiya-sour', name: 'Jouaiya', caza: 'Sour', governorate: 'South Lebanon', nameAr: 'جويا' },
  { id: 'al-bazourieh-sour', name: 'Al-Bazourieh', caza: 'Sour', governorate: 'South Lebanon', nameAr: 'البازورية' },
  { id: 'burj-el-chmali-sour', name: 'Burj El Chmali', caza: 'Sour', governorate: 'South Lebanon', nameAr: 'برج الشمالي' },
  { id: 'burj-rahal-sour', name: 'Burj Rahal', caza: 'Sour', governorate: 'South Lebanon', nameAr: 'برج رحال' },
  { id: 'naqoura-sour', name: 'Naqoura', caza: 'Sour', governorate: 'South Lebanon', nameAr: 'الناقورة' },
  { id: 'srifa-sour', name: 'Srifa', caza: 'Sour', governorate: 'South Lebanon', nameAr: 'صريفا' },
  { id: 'teir-debba-sour', name: 'Teir Debba', caza: 'Sour', governorate: 'South Lebanon', nameAr: 'طير دبا' },

  // SOUTH LEBANON - SAIDA (SIDON) CAZA
  { id: 'saida-city', name: 'Saida (Sidon)', caza: 'Saida', governorate: 'South Lebanon', nameAr: 'صيدا' },
  { id: 'ghazieh-saida', name: 'Ghazieh', caza: 'Saida', governorate: 'South Lebanon', nameAr: 'الغازية' },
  { id: 'hlalieh-saida', name: 'Hlalieh', caza: 'Saida', governorate: 'South Lebanon', nameAr: 'الهلالية' },
  { id: 'abra-saida', name: 'Abra', caza: 'Saida', governorate: 'South Lebanon', nameAr: 'عبرة' },
  { id: 'maghdouche-saida', name: 'Maghdouche', caza: 'Saida', governorate: 'South Lebanon', nameAr: 'مغدوشة' },
  { id: 'adloune-saida', name: 'Adloune', caza: 'Saida', governorate: 'South Lebanon', nameAr: 'عدلون' },
  { id: 'sarafand-saida', name: 'Sarafand', caza: 'Saida', governorate: 'South Lebanon', nameAr: 'الصرفند' },
  { id: 'mieh-w-mieh-saida', name: 'Mieh w Mieh', caza: 'Saida', governorate: 'South Lebanon', nameAr: 'المية ومية' },

  // NORTH LEBANON - TRIPOLI CAZA
  { id: 'tripoli-city', name: 'Tripoli', caza: 'Tripoli', governorate: 'North Lebanon', nameAr: 'طرابلس' },
  { id: 'mina-tripoli', name: 'Al-Mina', caza: 'Tripoli', governorate: 'North Lebanon', nameAr: 'الميناء' },
  { id: 'qalamoun-tripoli', name: 'Qalamoun', caza: 'Tripoli', governorate: 'North Lebanon', nameAr: 'القلمون' },
  { id: 'beddawi-tripoli', name: 'Beddawi', caza: 'Tripoli', governorate: 'North Lebanon', nameAr: 'البداوي' },

  // BEKAA - ZAHLE CAZA
  { id: 'zahle-city', name: 'Zahle', caza: 'Zahle', governorate: 'Bekaa', nameAr: 'زحلة' },
  { id: 'chtoura-zahle', name: 'Chtoura', caza: 'Zahle', governorate: 'Bekaa', nameAr: 'شتورا' },
  { id: 'bar-elias-zahle', name: 'Bar Elias', caza: 'Zahle', governorate: 'Bekaa', nameAr: 'بر الياس' },
  { id: 'saadnayel-zahle', name: 'Saadnayel', caza: 'Zahle', governorate: 'Bekaa', nameAr: 'سعدنايل' },
  { id: 'qaa-el-rim-zahle', name: 'Qaa El Rim', caza: 'Zahle', governorate: 'Bekaa', nameAr: 'قاع الريم' },
  { id: 'terbol-zahle', name: 'Terbol', caza: 'Zahle', governorate: 'Bekaa', nameAr: 'تربل' },
  { id: 'rayak-zahle', name: 'Rayak', caza: 'Zahle', governorate: 'Bekaa', nameAr: 'رياق' },

  // NABATIEH GOVERNORATE - NABATIEH CAZA
  { id: 'nabatieh-city', name: 'Nabatieh', caza: 'Nabatieh', governorate: 'Nabatieh', nameAr: 'النبطية' },
  { id: 'habbouch-nabatieh', name: 'Habbouch', caza: 'Nabatieh', governorate: 'Nabatieh', nameAr: 'حبوش' },
  { id: 'kfar-roummane-nabatieh', name: 'Kfar Roummane', caza: 'Nabatieh', governorate: 'Nabatieh', nameAr: 'كفر رمان' },
  { id: 'ansar-nabatieh', name: 'Ansar', caza: 'Nabatieh', governorate: 'Nabatieh', nameAr: 'أنصار' },
  { id: 'duweir-nabatieh', name: 'Duweir', caza: 'Nabatieh', governorate: 'Nabatieh', nameAr: 'الدوير' },

  // MOUNT LEBANON - KESERWAN CAZA
  { id: 'jounieh-keserwan', name: 'Jounieh', caza: 'Keserwan', governorate: 'Mount Lebanon', nameAr: 'جونيه' },
  { id: 'zouk-mikael-keserwan', name: 'Zouk Mikael', caza: 'Keserwan', governorate: 'Mount Lebanon', nameAr: 'زوق مكايل' },
  { id: 'zouk-mosbeh-keserwan', name: 'Zouk Mosbeh', caza: 'Keserwan', governorate: 'Mount Lebanon', nameAr: 'زوق مصبح' },
  { id: 'kaslik-keserwan', name: 'Kaslik', caza: 'Keserwan', governorate: 'Mount Lebanon', nameAr: 'الكسليك' },
  { id: 'sarba-keserwan', name: 'Sarba', caza: 'Keserwan', governorate: 'Mount Lebanon', nameAr: 'صربا' },
  { id: 'faraya-keserwan', name: 'Faraya', caza: 'Keserwan', governorate: 'Mount Lebanon', nameAr: 'فاريا' },
  { id: 'kfardebian-keserwan', name: 'Kfardebian', caza: 'Keserwan', governorate: 'Mount Lebanon', nameAr: 'كفردبيان' },
  { id: 'ajaltoun-keserwan', name: 'Ajaltoun', caza: 'Keserwan', governorate: 'Mount Lebanon', nameAr: 'عجلتون' },
  { id: 'ballouneh-keserwan', name: 'Ballouneh', caza: 'Keserwan', governorate: 'Mount Lebanon', nameAr: 'بلونة' },

  // MOUNT LEBANON - JBEIL (BYBLOS) CAZA
  { id: 'jbeil-city', name: 'Byblos (Jbeil)', caza: 'Jbeil', governorate: 'Mount Lebanon', nameAr: 'جبيل' },
  { id: 'amchit-jbeil', name: 'Amchit', caza: 'Jbeil', governorate: 'Mount Lebanon', nameAr: 'عمشيت' },
  { id: 'fidar-jbeil', name: 'Fidar', caza: 'Jbeil', governorate: 'Mount Lebanon', nameAr: 'الفيدار' },
  { id: 'kartaba-jbeil', name: 'Kartaba', caza: 'Jbeil', governorate: 'Mount Lebanon', nameAr: 'قرطبا' },
  { id: 'laqlouq-jbeil', name: 'Laqlouq', caza: 'Jbeil', governorate: 'Mount Lebanon', nameAr: 'العاقورة / اللقلوق' },

  // NORTH LEBANON - BATROUN CAZA
  { id: 'batroun-city', name: 'Batroun', caza: 'Batroun', governorate: 'North Lebanon', nameAr: 'البترون' },
  { id: 'chekka-batroun', name: 'Chekka', caza: 'Batroun', governorate: 'North Lebanon', nameAr: 'شكا' },
  { id: 'douma-batroun', name: 'Douma', caza: 'Batroun', governorate: 'North Lebanon', nameAr: 'دوما' },
  { id: 'tannourine-batroun', name: 'Tannourine', caza: 'Batroun', governorate: 'North Lebanon', nameAr: 'تنورين' },
  { id: 'hamat-batroun', name: 'Hamat', caza: 'Batroun', governorate: 'North Lebanon', nameAr: 'حامات' },

  // NORTH LEBANON - BCHARRE CAZA
  { id: 'bcharre-city', name: 'Bcharre', caza: 'Bcharre', governorate: 'North Lebanon', nameAr: 'بشري' },
  { id: 'hadchit-bcharre', name: 'Hadchit', caza: 'Bcharre', governorate: 'North Lebanon', nameAr: 'حدشيت' },
  { id: 'hasroun-bcharre', name: 'Hasroun', caza: 'Bcharre', governorate: 'North Lebanon', nameAr: 'حصرون' },
  { id: 'beqaakafra-bcharre', name: 'Beqaakafra', caza: 'Bcharre', governorate: 'North Lebanon', nameAr: 'بقاعكفرا' },

  // NORTH LEBANON - ZGHARTA CAZA
  { id: 'zgharta-city', name: 'Zgharta', caza: 'Zgharta', governorate: 'North Lebanon', nameAr: 'زغرتا' },
  { id: 'ehden-zgharta', name: 'Ehden', caza: 'Zgharta', governorate: 'North Lebanon', nameAr: 'إهدن' },
  { id: 'mejdlaya-zgharta', name: 'Mejdlaya', caza: 'Zgharta', governorate: 'North Lebanon', nameAr: 'مجدليا' },
  { id: 'arbet-kozah-zgharta', name: 'Arbet Kozhaya', caza: 'Zgharta', governorate: 'North Lebanon', nameAr: 'عربة قزحيا' },

  // BAALBEK-HERMEL GOVERNORATE
  { id: 'baalbek-city', name: 'Baalbek', caza: 'Baalbek', governorate: 'Baalbek-Hermel', nameAr: 'بعلبك' },
  { id: 'britel-baalbek', name: 'Britel', caza: 'Baalbek', governorate: 'Baalbek-Hermel', nameAr: 'بريتال' },
  { id: 'chmestar-baalbek', name: 'Chmestar', caza: 'Baalbek', governorate: 'Baalbek-Hermel', nameAr: 'شمسطار' },
  { id: 'deir-el-ahmar-baalbek', name: 'Deir El Ahmar', caza: 'Baalbek', governorate: 'Baalbek-Hermel', nameAr: 'دير الأحمر' },
  { id: 'arssal-baalbek', name: 'Arsal', caza: 'Baalbek', governorate: 'Baalbek-Hermel', nameAr: 'عرسال' },
  { id: 'hermel-city', name: 'Hermel', caza: 'Hermel', governorate: 'Baalbek-Hermel', nameAr: 'الهرمل' },
  { id: 'qaa-hermel', name: 'Al-Qaa', caza: 'Hermel', governorate: 'Baalbek-Hermel', nameAr: 'القاع' },

  // BEKAA - RASHAYA & WEST BEKAA
  { id: 'rashaya-city', name: 'Rashaya Al-Wadi', caza: 'Rashaya', governorate: 'Bekaa', nameAr: 'راشيا الوادي' },
  { id: 'dahr-el-ahmar-rashaya', name: 'Dahr El Ahmar', caza: 'Rashaya', governorate: 'Bekaa', nameAr: 'ضهر الأحمر' },
  { id: 'joub-jannine-west-bekaa', name: 'Joub Jannine', caza: 'West Bekaa', governorate: 'Bekaa', nameAr: 'جب جنين' },
  { id: 'saghbine-west-bekaa', name: 'Saghbine', caza: 'West Bekaa', governorate: 'Bekaa', nameAr: 'صغبين' },
  { id: 'qaraoun-west-bekaa', name: 'Qaraoun', caza: 'West Bekaa', governorate: 'Bekaa', nameAr: 'القرعون' },
  { id: 'machghara-west-bekaa', name: 'Machghara', caza: 'West Bekaa', governorate: 'Bekaa', nameAr: 'مشغرة' },

  // NABATIEH - MARJAYOUN, BENT JBEIL, HASBAYA
  { id: 'marjayoun-city', name: 'Marjayoun', caza: 'Marjayoun', governorate: 'Nabatieh', nameAr: 'مرجعيون' },
  { id: 'khiam-marjayoun', name: 'Al-Khiam', caza: 'Marjayoun', governorate: 'Nabatieh', nameAr: 'الخيام' },
  { id: 'kleiaa-marjayoun', name: 'Al-Kleiaa', caza: 'Marjayoun', governorate: 'Nabatieh', nameAr: 'القليعة' },
  { id: 'bent-jbeil-city', name: 'Bent Jbeil', caza: 'Bent Jbeil', governorate: 'Nabatieh', nameAr: 'بنت جبيل' },
  { id: 'teb歓-bent-jbeil', name: 'Tebnine', caza: 'Bent Jbeil', governorate: 'Nabatieh', nameAr: 'تبنين' },
  { id: 'ainata-bent-jbeil', name: 'Ainata', caza: 'Bent Jbeil', governorate: 'Nabatieh', nameAr: 'عيناتا' },
  { id: 'hasbaya-city', name: 'Hasbaya', caza: 'Hasbaya', governorate: 'Nabatieh', nameAr: 'حاصبيا' },
  { id: 'chebaa-hasbaya', name: 'Chebaa', caza: 'Hasbaya', governorate: 'Nabatieh', nameAr: 'شبعا' },

  // MOUNT LEBANON - CHOUF CAZA
  { id: 'deir-el-qamar-chouf', name: 'Deir El Qamar', caza: 'Chouf', governorate: 'Mount Lebanon', nameAr: 'دير القمر' },
  { id: 'beiteddine-chouf', name: 'Beiteddine', caza: 'Chouf', governorate: 'Mount Lebanon', nameAr: 'بيت الدين' },
  { id: 'baakline-chouf', name: 'Baakline', caza: 'Chouf', governorate: 'Mount Lebanon', nameAr: 'بعقلين' },
  { id: 'moukhtara-chouf', name: 'Moukhtara', caza: 'Chouf', governorate: 'Mount Lebanon', nameAr: 'المختارة' },
  { id: 'damour-chouf', name: 'Damour', caza: 'Chouf', governorate: 'Mount Lebanon', nameAr: 'الدامور' },
  { id: 'jiyeh-chouf', name: 'Jiyeh', caza: 'Chouf', governorate: 'Mount Lebanon', nameAr: 'الجية' },
  { id: 'barja-chouf', name: 'Barja', caza: 'Chouf', governorate: 'Mount Lebanon', nameAr: 'برجا' },
  { id: 'chehim-chouf', name: 'Chehim', caza: 'Chouf', governorate: 'Mount Lebanon', nameAr: 'شحيم' },

  // MOUNT LEBANON - METN CAZA
  { id: 'jdeideh-metn', name: 'Jdeideh', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'الجديدة' },
  { id: 'antelias-metn', name: 'Antelias', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'أنطلياس' },
  { id: 'sin-el-fil-metn', name: 'Sin El Fil', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'سن الفيل' },
  { id: 'bourj-hammoud-metn', name: 'Bourj Hammoud', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'برج حمود' },
  { id: 'mansourieh-metn', name: 'Mansourieh', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'المنصورية' },
  { id: 'bikfaya-metn', name: 'Bikfaya', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'بكفيا' },
  { id: 'dbayeh-metn', name: 'Dbayeh', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'الضبية' },
  { id: 'jal-el-dib-metn', name: 'Jal El Dib', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'جل الديب' },
  { id: 'beit-mery-metn', name: 'Beit Mery', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'بيت مري' },
  { id: 'broummana-metn', name: 'Broummana', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'برمانا' },
  { id: 'dekwaneh-metn', name: 'Dekwaneh', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'الدكوانة' },
  { id: 'fanar-metn', name: 'Fanar', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'الفنار' },
  { id: 'rabieh-metn', name: 'Rabieh', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'الرابية' },
  { id: 'zalka-metn', name: 'Zalka', caza: 'Metn', governorate: 'Mount Lebanon', nameAr: 'الزلقا' },

  // SOUTH LEBANON - JEZZINE CAZA
  { id: 'jezzine-city', name: 'Jezzine', caza: 'Jezzine', governorate: 'South Lebanon', nameAr: 'جزين' },
  { id: 'bkassine-jezzine', name: 'Bkassine', caza: 'Jezzine', governorate: 'South Lebanon', nameAr: 'بكاسين' },
  { id: 'roum-jezzine', name: 'Roum', caza: 'Jezzine', governorate: 'South Lebanon', nameAr: 'روم' },

  // AKKAR GOVERNORATE
  { id: 'halba-akkar', name: 'Halba', caza: 'Akkar', governorate: 'Akkar', nameAr: 'حلبا' },
  { id: 'qobayat-akkar', name: 'Al-Qobayat', caza: 'Akkar', governorate: 'Akkar', nameAr: 'القبيات' },
  { id: 'bebnine-akkar', name: 'Bebnine', caza: 'Akkar', governorate: 'Akkar', nameAr: 'ببنين' },
  { id: 'berqayel-akkar', name: 'Berkayel', caza: 'Akkar', governorate: 'Akkar', nameAr: 'برقايل' },
  { id: 'rahbeh-akkar', name: 'Rahbeh', caza: 'Akkar', governorate: 'Akkar', nameAr: 'رحبة' },

  // MINIEH-DANNIYEH CAZA (NORTH LEBANON)
  { id: 'minieh-city', name: 'Minieh', caza: 'Minieh-Danniyeh', governorate: 'North Lebanon', nameAr: 'المنية' },
  { id: 'sir-ed-danniyeh', name: 'Sir Ed-Danniyeh', caza: 'Minieh-Danniyeh', governorate: 'North Lebanon', nameAr: 'سير الضنية' },
  { id: 'bakhoun-danniyeh', name: 'Bakhoun', caza: 'Minieh-Danniyeh', governorate: 'North Lebanon', nameAr: 'بخعون' },
];

/**
 * Filter Lebanese cities by search query (matches city name, caza, or Arabic name)
 */
export function searchLebaneseCities(query: string): LebaneseCity[] {
  if (!query || !query.trim()) {
    return LEBANESE_CITIES;
  }
  const q = query.toLowerCase().trim();
  return LEBANESE_CITIES.filter((city) => {
    return (
      city.name.toLowerCase().includes(q) ||
      city.caza.toLowerCase().includes(q) ||
      city.governorate.toLowerCase().includes(q) ||
      (city.nameAr && city.nameAr.includes(q)) ||
      `${city.name} - ${city.caza}`.toLowerCase().includes(q)
    );
  });
}
