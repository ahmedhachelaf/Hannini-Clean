export type WilayaDefinition = {
  slug: string;
  name: {
    ar: string;
    fr: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
};

const DEFAULT_COORDINATES = { latitude: 36.7538, longitude: 3.0588 };

export const wilayas: WilayaDefinition[] = [
  { slug: "adrar", name: { ar: "أدرار", fr: "Adrar" }, coordinates: DEFAULT_COORDINATES },
  { slug: "chlef", name: { ar: "الشلف", fr: "Chlef" }, coordinates: DEFAULT_COORDINATES },
  { slug: "laghouat", name: { ar: "الأغواط", fr: "Laghouat" }, coordinates: DEFAULT_COORDINATES },
  { slug: "oum-el-bouaghi", name: { ar: "أم البواقي", fr: "Oum El Bouaghi" }, coordinates: DEFAULT_COORDINATES },
  { slug: "batna", name: { ar: "باتنة", fr: "Batna" }, coordinates: DEFAULT_COORDINATES },
  { slug: "bejaia", name: { ar: "بجاية", fr: "Béjaïa" }, coordinates: DEFAULT_COORDINATES },
  { slug: "biskra", name: { ar: "بسكرة", fr: "Biskra" }, coordinates: DEFAULT_COORDINATES },
  { slug: "bechar", name: { ar: "بشار", fr: "Béchar" }, coordinates: DEFAULT_COORDINATES },
  { slug: "blida", name: { ar: "البليدة", fr: "Blida" }, coordinates: DEFAULT_COORDINATES },
  { slug: "bouira", name: { ar: "البويرة", fr: "Bouira" }, coordinates: DEFAULT_COORDINATES },
  { slug: "tamanrasset", name: { ar: "تمنراست", fr: "Tamanrasset" }, coordinates: DEFAULT_COORDINATES },
  { slug: "tebessa", name: { ar: "تبسة", fr: "Tébessa" }, coordinates: DEFAULT_COORDINATES },
  { slug: "tlemcen", name: { ar: "تلمسان", fr: "Tlemcen" }, coordinates: DEFAULT_COORDINATES },
  { slug: "tiaret", name: { ar: "تيارت", fr: "Tiaret" }, coordinates: DEFAULT_COORDINATES },
  { slug: "tizi-ouzou", name: { ar: "تيزي وزو", fr: "Tizi Ouzou" }, coordinates: DEFAULT_COORDINATES },
  { slug: "algiers", name: { ar: "الجزائر العاصمة", fr: "Alger" }, coordinates: DEFAULT_COORDINATES },
  { slug: "djelfa", name: { ar: "الجلفة", fr: "Djelfa" }, coordinates: DEFAULT_COORDINATES },
  { slug: "jijel", name: { ar: "جيجل", fr: "Jijel" }, coordinates: DEFAULT_COORDINATES },
  { slug: "setif", name: { ar: "سطيف", fr: "Sétif" }, coordinates: DEFAULT_COORDINATES },
  { slug: "saida", name: { ar: "سعيدة", fr: "Saïda" }, coordinates: DEFAULT_COORDINATES },
  { slug: "skikda", name: { ar: "سكيكدة", fr: "Skikda" }, coordinates: DEFAULT_COORDINATES },
  { slug: "sidi-bel-abbes", name: { ar: "سيدي بلعباس", fr: "Sidi Bel Abbès" }, coordinates: DEFAULT_COORDINATES },
  { slug: "annaba", name: { ar: "عنابة", fr: "Annaba" }, coordinates: DEFAULT_COORDINATES },
  { slug: "guelma", name: { ar: "قالمة", fr: "Guelma" }, coordinates: DEFAULT_COORDINATES },
  { slug: "constantine", name: { ar: "قسنطينة", fr: "Constantine" }, coordinates: DEFAULT_COORDINATES },
  { slug: "medea", name: { ar: "المدية", fr: "Médéa" }, coordinates: DEFAULT_COORDINATES },
  { slug: "mostaganem", name: { ar: "مستغانم", fr: "Mostaganem" }, coordinates: DEFAULT_COORDINATES },
  { slug: "msila", name: { ar: "المسيلة", fr: "M'Sila" }, coordinates: DEFAULT_COORDINATES },
  { slug: "mascara", name: { ar: "معسكر", fr: "Mascara" }, coordinates: DEFAULT_COORDINATES },
  { slug: "ouargla", name: { ar: "ورقلة", fr: "Ouargla" }, coordinates: DEFAULT_COORDINATES },
  { slug: "oran", name: { ar: "وهران", fr: "Oran" }, coordinates: DEFAULT_COORDINATES },
  { slug: "el-bayadh", name: { ar: "البيض", fr: "El Bayadh" }, coordinates: DEFAULT_COORDINATES },
  { slug: "illizi", name: { ar: "إليزي", fr: "Illizi" }, coordinates: DEFAULT_COORDINATES },
  { slug: "bordj-bou-arreridj", name: { ar: "برج بوعريريج", fr: "Bordj Bou Arréridj" }, coordinates: DEFAULT_COORDINATES },
  { slug: "boumerdes", name: { ar: "بومرداس", fr: "Boumerdès" }, coordinates: DEFAULT_COORDINATES },
  { slug: "el-tarf", name: { ar: "الطارف", fr: "El Tarf" }, coordinates: DEFAULT_COORDINATES },
  { slug: "tindouf", name: { ar: "تندوف", fr: "Tindouf" }, coordinates: DEFAULT_COORDINATES },
  { slug: "tissemsilt", name: { ar: "تيسمسيلت", fr: "Tissemsilt" }, coordinates: DEFAULT_COORDINATES },
  { slug: "el-oued", name: { ar: "الوادي", fr: "El Oued" }, coordinates: DEFAULT_COORDINATES },
  { slug: "khenchela", name: { ar: "خنشلة", fr: "Khenchela" }, coordinates: DEFAULT_COORDINATES },
  { slug: "souk-ahras", name: { ar: "سوق أهراس", fr: "Souk Ahras" }, coordinates: DEFAULT_COORDINATES },
  { slug: "tipaza", name: { ar: "تيبازة", fr: "Tipaza" }, coordinates: DEFAULT_COORDINATES },
  { slug: "mila", name: { ar: "ميلة", fr: "Mila" }, coordinates: DEFAULT_COORDINATES },
  { slug: "ain-defla", name: { ar: "عين الدفلى", fr: "Aïn Defla" }, coordinates: DEFAULT_COORDINATES },
  { slug: "naama", name: { ar: "النعامة", fr: "Naâma" }, coordinates: DEFAULT_COORDINATES },
  { slug: "ain-temouchent", name: { ar: "عين تموشنت", fr: "Aïn Témouchent" }, coordinates: DEFAULT_COORDINATES },
  { slug: "ghardaia", name: { ar: "غرداية", fr: "Ghardaïa" }, coordinates: DEFAULT_COORDINATES },
  { slug: "relizane", name: { ar: "غليزان", fr: "Relizane" }, coordinates: DEFAULT_COORDINATES },
  { slug: "el-mghair", name: { ar: "المغير", fr: "El M'ghair" }, coordinates: DEFAULT_COORDINATES },
  { slug: "el-meniaa", name: { ar: "المنيعة", fr: "El Meniaa" }, coordinates: DEFAULT_COORDINATES },
  { slug: "ouled-djellal", name: { ar: "أولاد جلال", fr: "Ouled Djellal" }, coordinates: DEFAULT_COORDINATES },
  { slug: "bordj-baji-mokhtar", name: { ar: "برج باجي مختار", fr: "Bordj Baji Mokhtar" }, coordinates: DEFAULT_COORDINATES },
  { slug: "beni-abbes", name: { ar: "بني عباس", fr: "Béni Abbès" }, coordinates: DEFAULT_COORDINATES },
  { slug: "timimoun", name: { ar: "تيميمون", fr: "Timimoun" }, coordinates: DEFAULT_COORDINATES },
  { slug: "touggourt", name: { ar: "تقرت", fr: "Touggourt" }, coordinates: DEFAULT_COORDINATES },
  { slug: "djanet", name: { ar: "جانت", fr: "Djanet" }, coordinates: DEFAULT_COORDINATES },
  { slug: "in-salah", name: { ar: "عين صالح", fr: "In Salah" }, coordinates: DEFAULT_COORDINATES },
  { slug: "in-guezzam", name: { ar: "عين قزام", fr: "In Guezzam" }, coordinates: DEFAULT_COORDINATES },
];
