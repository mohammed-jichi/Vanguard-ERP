/**
 * Vanguard ERP — Master Lebanese Cities Directory
 * Exhaustive directory of Lebanese cities, towns, and municipalities
 * grouped by Caza (District) and Mohafazah (Governorate).
 */

export interface LebaneseCity {
  id: string;
  name: string;
  nameAr: string;
  caza: string;
  governorate: string;
}

export const LEBANESE_CITIES: LebaneseCity[] = [
  // ==========================================
  // BEIRUT GOVERNORATE
  // ==========================================
  { id: 'beirut-central', name: 'Beirut (Central / Downtown)', nameAr: 'بيروت (وسط المدينة)', caza: 'Beirut', governorate: 'Beirut' },
  { id: 'beirut-hamra', name: 'Beirut - Hamra', nameAr: 'بيروت - الحمرا', caza: 'Beirut', governorate: 'Beirut' },
  { id: 'beirut-achrafieh', name: 'Beirut - Achrafieh', nameAr: 'بيروت - الأشرفية', caza: 'Beirut', governorate: 'Beirut' },
  { id: 'beirut-badaro', name: 'Beirut - Badaro', nameAr: 'بيروت - بدارو', caza: 'Beirut', governorate: 'Beirut' },
  { id: 'beirut-verdun', name: 'Beirut - Verdun', nameAr: 'بيروت - فردان', caza: 'Beirut', governorate: 'Beirut' },
  { id: 'beirut-ras', name: 'Beirut - Ras Beirut', nameAr: 'بيروت - رأس بيروت', caza: 'Beirut', governorate: 'Beirut' },
  { id: 'beirut-mar-mikhael', name: 'Beirut - Mar Mikhael', nameAr: 'بيروت - مار مخايل', caza: 'Beirut', governorate: 'Beirut' },
  { id: 'beirut-gemmayzeh', name: 'Beirut - Gemmayzeh', nameAr: 'بيروت - الجميزة', caza: 'Beirut', governorate: 'Beirut' },
  { id: 'beirut-bachoura', name: 'Beirut - Bachoura', nameAr: 'بيروت - الباشورة', caza: 'Beirut', governorate: 'Beirut' },
  { id: 'beirut-mazraa', name: 'Beirut - Mazraa', nameAr: 'بيروت - المزرعة', caza: 'Beirut', governorate: 'Beirut' },
  { id: 'beirut-msaytbeh', name: 'Beirut - Msaytbeh', nameAr: 'بيروت - المصيطبة', caza: 'Beirut', governorate: 'Beirut' },

  // ==========================================
  // MOUNT LEBANON - ALEY CAZA
  // ==========================================
  { id: 'choueifat', name: 'Choueifat (معمل الشويفات)', nameAr: 'الشويفات', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'aabadiye', name: 'Aabadiye', nameAr: 'العبادية', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'aley-city', name: 'Aley', nameAr: 'عاليه', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'bhamdoun', name: 'Bhamdoun', nameAr: 'بحمدون', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'ain-aanoub', name: 'Ain Aanoub', nameAr: 'عين عنوب', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'aramoun', name: 'Aramoun', nameAr: 'عرمون', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'bchamoun', name: 'Bchamoun', nameAr: 'بشامون', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'khaldeh', name: 'Khaldeh', nameAr: 'خلدة', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'souk-el-gharb', name: 'Souk El Gharb', nameAr: 'سوق الغرب', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'ainab', name: 'Ainab', nameAr: 'عيناب', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'mansourieh-bhamdoun', name: 'Mansourieh Bhamdoun', nameAr: 'منصورية بحمدون', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'choueifat-al-omara', name: 'Choueifat Al-Omara', nameAr: 'الشويفات الأمراء', caza: 'Aley', governorate: 'Mount Lebanon' },
  { id: 'choueifat-al-qubbeh', name: 'Choueifat Al-Qubbeh', nameAr: 'الشويفات القبة', caza: 'Aley', governorate: 'Mount Lebanon' },

  // ==========================================
  // MOUNT LEBANON - BAABDA CAZA
  // ==========================================
  { id: 'baabda-city', name: 'Baabda', nameAr: 'بعبدا', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'hadath', name: 'Hadath', nameAr: 'الحدث', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'hazmieh', name: 'Hazmieh', nameAr: 'الحازمية', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'furn-el-chebbak', name: 'Furn El Chebbak', nameAr: 'فرن الشباك', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'chiyah', name: 'Chiyah', nameAr: 'الشياح', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'haret-hreik', name: 'Haret Hreik', nameAr: 'حارة حريك', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'ghobeiry', name: 'Ghobeiry', nameAr: 'الغبيري', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'kfarchima', name: 'Kfarchima', nameAr: 'كفرشيما', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'yarze', name: 'Yarze', nameAr: 'اليرزة', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'jamhour', name: 'Jamhour', nameAr: 'الجمهور', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'hammana', name: 'Hammana', nameAr: 'حمانا', caza: 'Baabda', governorate: 'Mount Lebanon' },
  { id: 'falougha', name: 'Falougha', nameAr: 'فالوغا', caza: 'Baabda', governorate: 'Mount Lebanon' },

  // ==========================================
  // MOUNT LEBANON - MATN CAZA
  // ==========================================
  { id: 'jdeideh', name: 'Jdeideh', nameAr: 'الجديدة', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'bauchrieh', name: 'Bauchrieh', nameAr: 'البوشرية', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'bourj-hammoud', name: 'Bourj Hammoud', nameAr: 'برج حمود', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'sin-el-fil', name: 'Sin El Fil', nameAr: 'سن الفيل', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'dbayeh', name: 'Dbayeh', nameAr: 'الضبية', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'antelias', name: 'Antelias', nameAr: 'أنطلياس', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'jal-el-dib', name: 'Jal El Dib', nameAr: 'جل الديب', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'mansourieh-matn', name: 'Mansourieh (Matn)', nameAr: 'المنصورية', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'bikfaya', name: 'Bikfaya', nameAr: 'بكفيا', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'beit-mery', name: 'Beit Mery', nameAr: 'بيت مري', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'broummana', name: 'Broummana', nameAr: 'برمانا', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'dekweneh', name: 'Dekweneh', nameAr: 'الدكوانة', caza: 'Matn', governorate: 'Mount Lebanon' },
  { id: 'rabieh', name: 'Rabieh', nameAr: 'الرابية', caza: 'Matn', governorate: 'Mount Lebanon' },

  // ==========================================
  // MOUNT LEBANON - CHOUF CAZA
  // ==========================================
  { id: 'deir-el-qamar', name: 'Deir El Qamar', nameAr: 'دير القمر', caza: 'Chouf', governorate: 'Mount Lebanon' },
  { id: 'beit-ed-dine', name: 'Beit ed-Dine', nameAr: 'بيت الدين', caza: 'Chouf', governorate: 'Mount Lebanon' },
  { id: 'baakline', name: 'Baakline', nameAr: 'بعقلين', caza: 'Chouf', governorate: 'Mount Lebanon' },
  { id: 'damour', name: 'Damour', nameAr: 'الدامور', caza: 'Chouf', governorate: 'Mount Lebanon' },
  { id: 'naameh', name: 'Naameh', nameAr: 'الناعمة', caza: 'Chouf', governorate: 'Mount Lebanon' },
  { id: 'barja', name: 'Barja', nameAr: 'برجا', caza: 'Chouf', governorate: 'Mount Lebanon' },
  { id: 'chehim', name: 'Chehim', nameAr: 'شحيم', caza: 'Chouf', governorate: 'Mount Lebanon' },
  { id: 'jiyeh', name: 'Jiyeh', nameAr: 'الجية', caza: 'Chouf', governorate: 'Mount Lebanon' },
  { id: 'moukhtara', name: 'Moukhtara', nameAr: 'المختارة', caza: 'Chouf', governorate: 'Mount Lebanon' },

  // ==========================================
  // MOUNT LEBANON - KESERWAN & JBEIL
  // ==========================================
  { id: 'jounieh', name: 'Jounieh', nameAr: 'جونيه', caza: 'Keserwan', governorate: 'Mount Lebanon' },
  { id: 'zouk-mikael', name: 'Zouk Mikael', nameAr: 'زوق مكايل', caza: 'Keserwan', governorate: 'Mount Lebanon' },
  { id: 'zouk-mosbeh', name: 'Zouk Mosbeh', nameAr: 'زوق مصبح', caza: 'Keserwan', governorate: 'Mount Lebanon' },
  { id: 'kaslik', name: 'Kaslik', nameAr: 'الكسليك', caza: 'Keserwan', governorate: 'Mount Lebanon' },
  { id: 'ghazir', name: 'Ghazir', nameAr: 'غزير', caza: 'Keserwan', governorate: 'Mount Lebanon' },
  { id: 'faraya', name: 'Faraya', nameAr: 'فاريا', caza: 'Keserwan', governorate: 'Mount Lebanon' },
  { id: 'kfardebian', name: 'Kfardebian', nameAr: 'كفردبيان', caza: 'Keserwan', governorate: 'Mount Lebanon' },
  { id: 'byblos-jbeil', name: 'Byblos (Jbeil)', nameAr: 'جبيل', caza: 'Jbeil', governorate: 'Mount Lebanon' },
  { id: 'amchit', name: 'Amchit', nameAr: 'عمشيت', caza: 'Jbeil', governorate: 'Mount Lebanon' },
  { id: 'halat', name: 'Halat', nameAr: 'حالات', caza: 'Jbeil', governorate: 'Mount Lebanon' },
  { id: 'kartaba', name: 'Kartaba', nameAr: 'قرطبا', caza: 'Jbeil', governorate: 'Mount Lebanon' },

  // ==========================================
  // NORTH LEBANON - KOURA, TRIPOLI, BATROUN
  // ==========================================
  { id: 'aaba', name: 'Aaba', nameAr: 'عابا', caza: 'Koura', governorate: 'North Lebanon' },
  { id: 'amioun', name: 'Amioun', nameAr: 'أميون', caza: 'Koura', governorate: 'North Lebanon' },
  { id: 'kousba', name: 'Kousba', nameAr: 'كوسبا', caza: 'Koura', governorate: 'North Lebanon' },
  { id: 'anfeh', name: 'Anfeh (Enfeh)', nameAr: 'أنفه', caza: 'Koura', governorate: 'North Lebanon' },
  { id: 'deddeh', name: 'Deddeh', nameAr: 'دده', caza: 'Koura', governorate: 'North Lebanon' },
  { id: 'bkeftine', name: 'Bkeftine', nameAr: 'بكفتين', caza: 'Koura', governorate: 'North Lebanon' },
  { id: 'tripoli-city', name: 'Tripoli', nameAr: 'طرابلس', caza: 'Tripoli', governorate: 'North Lebanon' },
  { id: 'el-mina', name: 'El Mina', nameAr: 'الميناء', caza: 'Tripoli', governorate: 'North Lebanon' },
  { id: 'qalamoun', name: 'Qalamoun', nameAr: 'القلمون', caza: 'Tripoli', governorate: 'North Lebanon' },
  { id: 'beddawi', name: 'Beddawi', nameAr: 'البداوي', caza: 'Tripoli', governorate: 'North Lebanon' },
  { id: 'zgharta', name: 'Zgharta', nameAr: 'زغرتا', caza: 'Zgharta', governorate: 'North Lebanon' },
  { id: 'ehden', name: 'Ehden', nameAr: 'إهدن', caza: 'Zgharta', governorate: 'North Lebanon' },
  { id: 'batroun-city', name: 'Batroun', nameAr: 'البترون', caza: 'Batroun', governorate: 'North Lebanon' },
  { id: 'chekka', name: 'Chekka', nameAr: 'شكا', caza: 'Batroun', governorate: 'North Lebanon' },
  { id: 'tannourine', name: 'Tannourine', nameAr: 'تنورين', caza: 'Batroun', governorate: 'North Lebanon' },
  { id: 'douma', name: 'Douma', nameAr: 'دوما', caza: 'Batroun', governorate: 'North Lebanon' },
  { id: 'bcharre-city', name: 'Bcharre', nameAr: 'بشري', caza: 'Bcharre', governorate: 'North Lebanon' },
  { id: 'hasroun', name: 'Hasroun', nameAr: 'حصرون', caza: 'Bcharre', governorate: 'North Lebanon' },
  { id: 'halba', name: 'Halba', nameAr: 'حلبا', caza: 'Akkar', governorate: 'Akkar' },
  { id: 'qobayat', name: 'Qobayat', nameAr: 'القبيات', caza: 'Akkar', governorate: 'Akkar' },

  // ==========================================
  // SOUTH LEBANON & NABATIEH
  // ==========================================
  { id: 'saida-city', name: 'Saida (Sidon)', nameAr: 'صيدا', caza: 'Saida', governorate: 'South Lebanon' },
  { id: 'ghazieh', name: 'Ghazieh', nameAr: 'الغازية', caza: 'Saida', governorate: 'South Lebanon' },
  { id: 'maghdouche', name: 'Maghdouche', nameAr: 'مغدوشة', caza: 'Saida', governorate: 'South Lebanon' },
  { id: 'haret-saida', name: 'Haret Saida', nameAr: 'حارة صيدا', caza: 'Saida', governorate: 'South Lebanon' },
  { id: 'sarafand', name: 'Sarafand', nameAr: 'الصرفند', caza: 'Saida', governorate: 'South Lebanon' },
  { id: 'adloun', name: 'Adloun', nameAr: 'عدلون', caza: 'Saida', governorate: 'South Lebanon' },
  { id: 'sour-city', name: 'Sour (Tyre)', nameAr: 'صور', caza: 'Tyre', governorate: 'South Lebanon' },
  { id: 'qana', name: 'Qana', nameAr: 'قانا', caza: 'Tyre', governorate: 'South Lebanon' },
  { id: 'jouaiya', name: 'Jouaiya', nameAr: 'جويا', caza: 'Tyre', governorate: 'South Lebanon' },
  { id: 'naqoura', name: 'Naqoura', nameAr: 'الناقورة', caza: 'Tyre', governorate: 'South Lebanon' },
  { id: 'bazouriyeh', name: 'Bazouriyeh', nameAr: 'البازورية', caza: 'Tyre', governorate: 'South Lebanon' },
  { id: 'abbassiyeh', name: 'Abbassiyeh', nameAr: 'العباسية', caza: 'Tyre', governorate: 'South Lebanon' },
  { id: 'jezzine-city', name: 'Jezzine', nameAr: 'جزين', caza: 'Jezzine', governorate: 'South Lebanon' },
  { id: 'bkassine', name: 'Bkassine', nameAr: 'بكاسين', caza: 'Jezzine', governorate: 'South Lebanon' },
  { id: 'nabatieh-city', name: 'Nabatieh', nameAr: 'النبطية', caza: 'Nabatieh', governorate: 'Nabatieh' },
  { id: 'kfar-remmane', name: 'Kfar Remmane', nameAr: 'كفررمان', caza: 'Nabatieh', governorate: 'Nabatieh' },
  { id: 'habbouch', name: 'Habbouch', nameAr: 'حبوش', caza: 'Nabatieh', governorate: 'Nabatieh' },
  { id: 'ansar', name: 'Ansar', nameAr: 'أنصار', caza: 'Nabatieh', governorate: 'Nabatieh' },
  { id: 'bint-jbeil-city', name: 'Bint Jbeil', nameAr: 'بنت جبيل', caza: 'Bint Jbeil', governorate: 'Nabatieh' },
  { id: 'tebnine', name: 'Tebnine', nameAr: 'تبنين', caza: 'Bint Jbeil', governorate: 'Nabatieh' },
  { id: 'aita-chaab', name: 'Aita al-Shaab', nameAr: 'عيتا الشعب', caza: 'Bint Jbeil', governorate: 'Nabatieh' },
  { id: 'marjeyoun-city', name: 'Marjeyoun', nameAr: 'مرجعيون', caza: 'Marjeyoun', governorate: 'Nabatieh' },
  { id: 'khiam', name: 'Khiam', nameAr: 'الخيام', caza: 'Marjeyoun', governorate: 'Nabatieh' },
  { id: 'hasbaya-city', name: 'Hasbaya', nameAr: 'حاصبيا', caza: 'Hasbaya', governorate: 'Nabatieh' },
  { id: 'chebaa', name: 'Chebaa', nameAr: 'شبعا', caza: 'Hasbaya', governorate: 'Nabatieh' },

  // ==========================================
  // BEKAA & BAALBEK-HERMEL
  // ==========================================
  { id: 'zahle-city', name: 'Zahle', nameAr: 'زحلة', caza: 'Zahle', governorate: 'Bekaa' },
  { id: 'chtaura', name: 'Chtaura', nameAr: 'شتورا', caza: 'Zahle', governorate: 'Bekaa' },
  { id: 'bar-elias', name: 'Bar Elias', nameAr: 'بر الياس', caza: 'Zahle', governorate: 'Bekaa' },
  { id: 'saadnayel', name: 'Saadnayel', nameAr: 'سعدنايل', caza: 'Zahle', governorate: 'Bekaa' },
  { id: 'rayak', name: 'Rayak', nameAr: 'رياق', caza: 'Zahle', governorate: 'Bekaa' },
  { id: 'majdel-anjar', name: 'Majdel Anjar', nameAr: 'مجدل عنجر', caza: 'Zahle', governorate: 'Bekaa' },
  { id: 'joub-jannine', name: 'Joub Jannine', nameAr: 'جب جنين', caza: 'West Bekaa', governorate: 'Bekaa' },
  { id: 'qaraoun', name: 'Qaraoun', nameAr: 'القرعون', caza: 'West Bekaa', governorate: 'Bekaa' },
  { id: 'machghara', name: 'Machghara', nameAr: 'مشغرة', caza: 'West Bekaa', governorate: 'Bekaa' },
  { id: 'rashaya-city', name: 'Rashaya El Wadi', nameAr: 'راشيا الوادي', caza: 'Rashaya', governorate: 'Bekaa' },
  { id: 'baalbek-city', name: 'Baalbek', nameAr: 'بعلبك', caza: 'Baalbek', governorate: 'Baalbek-Hermel' },
  { id: 'brital', name: 'Brital', nameAr: 'بريتال', caza: 'Baalbek', governorate: 'Baalbek-Hermel' },
  { id: 'chmistar', name: 'Chmistar', nameAr: 'شمسطار', caza: 'Baalbek', governorate: 'Baalbek-Hermel' },
  { id: 'deir-el-ahmar', name: 'Deir El Ahmar', nameAr: 'دير الأحمر', caza: 'Baalbek', governorate: 'Baalbek-Hermel' },
  { id: 'arsal', name: 'Arsal', nameAr: 'عرسال', caza: 'Baalbek', governorate: 'Baalbek-Hermel' },
  { id: 'hermel-city', name: 'Hermel', nameAr: 'الهرمل', caza: 'Hermel', governorate: 'Baalbek-Hermel' },
  { id: 'qaa', name: 'Qaa', nameAr: 'القاع', caza: 'Hermel', governorate: 'Baalbek-Hermel' },
];

/**
 * Filter Lebanese cities by search term matching English or Arabic name, or Caza/Governorate
 */
export function searchLebaneseCities(query: string): LebaneseCity[] {
  if (!query || !query.trim()) return LEBANESE_CITIES;
  const q = query.toLowerCase().trim();
  return LEBANESE_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameAr.includes(q) ||
      c.caza.toLowerCase().includes(q) ||
      c.governorate.toLowerCase().includes(q)
  );
}

/**
 * Grouped cities by Caza and Governorate for nested option selection
 */
export interface CazaGroup {
  governorate: string;
  caza: string;
  cities: LebaneseCity[];
}

export function getGroupedLebaneseCities(): CazaGroup[] {
  const groups: Record<string, CazaGroup> = {};

  for (const city of LEBANESE_CITIES) {
    const key = `${city.governorate} — ${city.caza}`;
    if (!groups[key]) {
      groups[key] = {
        governorate: city.governorate,
        caza: city.caza,
        cities: [],
      };
    }
    groups[key].cities.push(city);
  }

  return Object.values(groups);
}
