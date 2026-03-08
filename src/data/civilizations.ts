export interface Civilization {
  id: string;
  name: string;
  slug: string;
  dateRange: string;
  region: string;
  era: "Ancient" | "Medieval" | "Modern";
  regionGroup: "Asia" | "Europe" | "Africa" | "Americas" | "Middle East";
  colorKey: string;
  wikipediaTitle: string;
  description?: string;
  imageUrl?: string;
  articleCount?: number;
}

export const civilizations: Civilization[] = [
  {
    id: "egypt",
    name: "Ancient Egypt",
    slug: "ancient-egypt",
    dateRange: "3100 BCE – 30 BCE",
    region: "North Africa",
    era: "Ancient",
    regionGroup: "Africa",
    colorKey: "civ-egypt",
    wikipediaTitle: "Ancient_Egypt",
  },
  {
    id: "greece",
    name: "Ancient Greece",
    slug: "ancient-greece",
    dateRange: "800 BCE – 146 BCE",
    region: "Southern Europe",
    era: "Ancient",
    regionGroup: "Europe",
    colorKey: "civ-greece",
    wikipediaTitle: "Ancient_Greece",
  },
  {
    id: "rome",
    name: "Roman Empire",
    slug: "roman-empire",
    dateRange: "27 BCE – 476 CE",
    region: "Mediterranean",
    era: "Ancient",
    regionGroup: "Europe",
    colorKey: "civ-rome",
    wikipediaTitle: "Roman_Empire",
  },
  {
    id: "china",
    name: "Imperial China",
    slug: "imperial-china",
    dateRange: "221 BCE – 1912 CE",
    region: "East Asia",
    era: "Ancient",
    regionGroup: "Asia",
    colorKey: "civ-china",
    wikipediaTitle: "Imperial_China",
  },
  {
    id: "india",
    name: "Ancient India",
    slug: "ancient-india",
    dateRange: "2600 BCE – 500 CE",
    region: "South Asia",
    era: "Ancient",
    regionGroup: "Asia",
    colorKey: "civ-india",
    wikipediaTitle: "History_of_India",
  },
  {
    id: "japan",
    name: "Feudal Japan",
    slug: "feudal-japan",
    dateRange: "1185 – 1868 CE",
    region: "East Asia",
    era: "Medieval",
    regionGroup: "Asia",
    colorKey: "civ-japan",
    wikipediaTitle: "Feudal_Japan",
  },
  {
    id: "islamic",
    name: "Islamic Golden Age",
    slug: "islamic-golden-age",
    dateRange: "750 – 1258 CE",
    region: "Middle East & North Africa",
    era: "Medieval",
    regionGroup: "Middle East",
    colorKey: "civ-islamic",
    wikipediaTitle: "Islamic_Golden_Age",
  },
  {
    id: "mesoamerican",
    name: "Mesoamerican Civilizations",
    slug: "mesoamerican",
    dateRange: "2000 BCE – 1521 CE",
    region: "Central America",
    era: "Ancient",
    regionGroup: "Americas",
    colorKey: "civ-mesoamerican",
    wikipediaTitle: "Mesoamerica",
  },
  {
    id: "african",
    name: "Sub-Saharan African Kingdoms",
    slug: "african-kingdoms",
    dateRange: "300 – 1897 CE",
    region: "Sub-Saharan Africa",
    era: "Medieval",
    regionGroup: "Africa",
    colorKey: "civ-african",
    wikipediaTitle: "African_empires",
  },
  {
    id: "western",
    name: "Western Modern Era",
    slug: "western-modern",
    dateRange: "1500 – Present",
    region: "Europe & Americas",
    era: "Modern",
    regionGroup: "Europe",
    colorKey: "civ-western",
    wikipediaTitle: "Western_civilization",
  },
];
