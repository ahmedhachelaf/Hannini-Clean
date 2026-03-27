import { wilayaCoordinates } from "@/data/wilaya-coordinates";

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const coordinateBySlug = new Map(
  wilayaCoordinates.map((row) => [
    slugify(row.french.trim()),
    { latitude: row.latitude, longitude: row.longitude },
  ]),
);

const slugAliases: Record<string, string> = {
  "bordj-baji-mokhtar": "bordj-badji-mokhtar",
  "el-meniaa": "el-menia",
  "msila": "m-sila",
};

function resolveCoordinates(slug: string) {
  return coordinateBySlug.get(slug) ?? coordinateBySlug.get(slugAliases[slug] ?? "") ?? DEFAULT_COORDINATES;
}

export const wilayas: WilayaDefinition[] = [
  { slug: "adrar", name: { ar: "أدرار", fr: "Adrar" }, coordinates: resolveCoordinates("adrar") },
  { slug: "chlef", name: { ar: "الشلف", fr: "Chlef" }, coordinates: resolveCoordinates("chlef") },
  { slug: "laghouat", name: { ar: "الأغواط", fr: "Laghouat" }, coordinates: resolveCoordinates("laghouat") },
  { slug: "oum-el-bouaghi", name: { ar: "أم البواقي", fr: "Oum El Bouaghi" }, coordinates: resolveCoordinates("oum-el-bouaghi") },
  { slug: "batna", name: { ar: "باتنة", fr: "Batna" }, coordinates: resolveCoordinates("batna") },
  { slug: "bejaia", name: { ar: "بجاية", fr: "Béjaïa" }, coordinates: resolveCoordinates("bejaia") },
  { slug: "biskra", name: { ar: "بسكرة", fr: "Biskra" }, coordinates: resolveCoordinates("biskra") },
  { slug: "bechar", name: { ar: "بشار", fr: "Béchar" }, coordinates: resolveCoordinates("bechar") },
  { slug: "blida", name: { ar: "البليدة", fr: "Blida" }, coordinates: resolveCoordinates("blida") },
  { slug: "bouira", name: { ar: "البويرة", fr: "Bouira" }, coordinates: resolveCoordinates("bouira") },
  { slug: "tamanrasset", name: { ar: "تمنراست", fr: "Tamanrasset" }, coordinates: resolveCoordinates("tamanrasset") },
  { slug: "tebessa", name: { ar: "تبسة", fr: "Tébessa" }, coordinates: resolveCoordinates("tebessa") },
  { slug: "tlemcen", name: { ar: "تلمسان", fr: "Tlemcen" }, coordinates: resolveCoordinates("tlemcen") },
  { slug: "tiaret", name: { ar: "تيارت", fr: "Tiaret" }, coordinates: resolveCoordinates("tiaret") },
  { slug: "tizi-ouzou", name: { ar: "تيزي وزو", fr: "Tizi Ouzou" }, coordinates: resolveCoordinates("tizi-ouzou") },
  { slug: "algiers", name: { ar: "الجزائر العاصمة", fr: "Alger" }, coordinates: resolveCoordinates("alger") },
  { slug: "djelfa", name: { ar: "الجلفة", fr: "Djelfa" }, coordinates: resolveCoordinates("djelfa") },
  { slug: "jijel", name: { ar: "جيجل", fr: "Jijel" }, coordinates: resolveCoordinates("jijel") },
  { slug: "setif", name: { ar: "سطيف", fr: "Sétif" }, coordinates: resolveCoordinates("setif") },
  { slug: "saida", name: { ar: "سعيدة", fr: "Saïda" }, coordinates: resolveCoordinates("saida") },
  { slug: "skikda", name: { ar: "سكيكدة", fr: "Skikda" }, coordinates: resolveCoordinates("skikda") },
  { slug: "sidi-bel-abbes", name: { ar: "سيدي بلعباس", fr: "Sidi Bel Abbès" }, coordinates: resolveCoordinates("sidi-bel-abbes") },
  { slug: "annaba", name: { ar: "عنابة", fr: "Annaba" }, coordinates: resolveCoordinates("annaba") },
  { slug: "guelma", name: { ar: "قالمة", fr: "Guelma" }, coordinates: resolveCoordinates("guelma") },
  { slug: "constantine", name: { ar: "قسنطينة", fr: "Constantine" }, coordinates: resolveCoordinates("constantine") },
  { slug: "medea", name: { ar: "المدية", fr: "Médéa" }, coordinates: resolveCoordinates("medea") },
  { slug: "mostaganem", name: { ar: "مستغانم", fr: "Mostaganem" }, coordinates: resolveCoordinates("mostaganem") },
  { slug: "msila", name: { ar: "المسيلة", fr: "M'Sila" }, coordinates: resolveCoordinates("m-sila") },
  { slug: "mascara", name: { ar: "معسكر", fr: "Mascara" }, coordinates: resolveCoordinates("mascara") },
  { slug: "ouargla", name: { ar: "ورقلة", fr: "Ouargla" }, coordinates: resolveCoordinates("ouargla") },
  { slug: "oran", name: { ar: "وهران", fr: "Oran" }, coordinates: resolveCoordinates("oran") },
  { slug: "el-bayadh", name: { ar: "البيض", fr: "El Bayadh" }, coordinates: resolveCoordinates("el-bayadh") },
  { slug: "illizi", name: { ar: "إليزي", fr: "Illizi" }, coordinates: resolveCoordinates("illizi") },
  { slug: "bordj-bou-arreridj", name: { ar: "برج بوعريريج", fr: "Bordj Bou Arréridj" }, coordinates: resolveCoordinates("bordj-bou-arreridj") },
  { slug: "boumerdes", name: { ar: "بومرداس", fr: "Boumerdès" }, coordinates: resolveCoordinates("boumerdes") },
  { slug: "el-tarf", name: { ar: "الطارف", fr: "El Tarf" }, coordinates: resolveCoordinates("el-tarf") },
  { slug: "tindouf", name: { ar: "تندوف", fr: "Tindouf" }, coordinates: resolveCoordinates("tindouf") },
  { slug: "tissemsilt", name: { ar: "تيسمسيلت", fr: "Tissemsilt" }, coordinates: resolveCoordinates("tissemsilt") },
  { slug: "el-oued", name: { ar: "الوادي", fr: "El Oued" }, coordinates: resolveCoordinates("el-oued") },
  { slug: "khenchela", name: { ar: "خنشلة", fr: "Khenchela" }, coordinates: resolveCoordinates("khenchela") },
  { slug: "souk-ahras", name: { ar: "سوق أهراس", fr: "Souk Ahras" }, coordinates: resolveCoordinates("souk-ahras") },
  { slug: "tipaza", name: { ar: "تيبازة", fr: "Tipaza" }, coordinates: resolveCoordinates("tipaza") },
  { slug: "mila", name: { ar: "ميلة", fr: "Mila" }, coordinates: resolveCoordinates("mila") },
  { slug: "ain-defla", name: { ar: "عين الدفلى", fr: "Aïn Defla" }, coordinates: resolveCoordinates("ain-defla") },
  { slug: "naama", name: { ar: "النعامة", fr: "Naâma" }, coordinates: resolveCoordinates("naama") },
  { slug: "ain-temouchent", name: { ar: "عين تموشنت", fr: "Aïn Témouchent" }, coordinates: resolveCoordinates("ain-temouchent") },
  { slug: "ghardaia", name: { ar: "غرداية", fr: "Ghardaïa" }, coordinates: resolveCoordinates("ghardaia") },
  { slug: "relizane", name: { ar: "غليزان", fr: "Relizane" }, coordinates: resolveCoordinates("relizane") },
  { slug: "el-mghair", name: { ar: "المغير", fr: "El M'ghair" }, coordinates: resolveCoordinates("el-mghair") },
  { slug: "el-meniaa", name: { ar: "المنيعة", fr: "El Meniaa" }, coordinates: resolveCoordinates("el-meniaa") },
  { slug: "ouled-djellal", name: { ar: "أولاد جلال", fr: "Ouled Djellal" }, coordinates: resolveCoordinates("ouled-djellal") },
  { slug: "bordj-baji-mokhtar", name: { ar: "برج باجي مختار", fr: "Bordj Baji Mokhtar" }, coordinates: resolveCoordinates("bordj-baji-mokhtar") },
  { slug: "beni-abbes", name: { ar: "بني عباس", fr: "Béni Abbès" }, coordinates: resolveCoordinates("beni-abbes") },
  { slug: "timimoun", name: { ar: "تيميمون", fr: "Timimoun" }, coordinates: resolveCoordinates("timimoun") },
  { slug: "touggourt", name: { ar: "تقرت", fr: "Touggourt" }, coordinates: resolveCoordinates("touggourt") },
  { slug: "djanet", name: { ar: "جانت", fr: "Djanet" }, coordinates: resolveCoordinates("djanet") },
  { slug: "in-salah", name: { ar: "عين صالح", fr: "In Salah" }, coordinates: resolveCoordinates("in-salah") },
  { slug: "in-guezzam", name: { ar: "عين قزام", fr: "In Guezzam" }, coordinates: resolveCoordinates("in-guezzam") },
];
