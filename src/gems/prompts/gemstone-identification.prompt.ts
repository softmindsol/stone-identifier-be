export const GEMSTONE_DATABASE_LIST = [
  'Albite', 'Agate', 'Alexandrite', 'Almandine', 'Amazonite', 'Amber', 'Amethyst', 
  'Ametrine', 'Ammolite', 'Analcime', 'Anatase', 'Andalusite', 'Andesine', 'Andradite', 
  'Anglesite', 'Anhydrite', 'Apatite', 'Apophyllite', 'Aquamarine', 'Aragonite', 'Axinite', 
  'Azurite', 'Baryte', 'Basalt', 'Bastnasite', 'Benitoite', 'Beryl', 'Biotite', 'Bloodstone', 
  'Bornite', 'Brazilianite', 'Calcite', 'Cancrinite', 'Carnelian', 'Cassiterite', 'Celestine', 
  'Cerussite', 'Chalcedony', 'Chalcopyrite', 'Charoite', 'Chert', 'Chiastolite', 'Chrysoberyl', 
  'Chrysocolla', 'Chrysoprase', 'Cinnabar', 'Citrine', 'Clinohumite', 'Coal', 'Coral', 
  'Cordierite', 'Corundum', 'Covellite', 'Crocoite', 'Cuprite', 'Danburite', 'Datolite', 
  'Demantoid', 'Diamond', 'Diaspore', 'Diopside', 'Dioptase', 'Dolostone', 'Dolomite', 
  'Dumortierite', 'Emerald', 'Enstatite', 'Epidote', 'Euclase', 'Feldspar', 'Flint', 
  'Fluorapatite', 'Fluorite', 'Forsterite', 'Gahnite', 'Gabbro', 'Garnet', 'Galena', 
  'Gaspeite', 'Gneiss', 'Granite', 'Graphite', 'Grossular', 'Halite', 'Gypsum', 'Hematite', 
  'Hemimorphite', 'Herderite', 'Hessonite', 'Iolite', 'Jade', 'Jasper', 'Jadeite', 'Jet', 
  'Kornerupine', 'Kunzite', 'Kyanite', 'Lapis Lazuli', 'Labradorite', 'Larimar', 'Lazulite', 
  'Limestone', 'Lepidolite', 'Malachite', 'Marble', 'Microcline', 'Moldavite', 'Mimetite', 
  'Moonstone', 'Morganite', 'Nephrite', 'Moss Agate', 'Obsidian', 'Oligoclase', 'Olivine', 
  'Onyx', 'Opal', 'Peridot', 'Orthoclase', 'Peridotite', 'Petalite', 'Phenakite', 'Pietersite', 
  'Prehnite', 'Pumice', 'Proustite', 'Pyrite', 'Pyrope', 'Pyrrhotite', 'Quartz', 'Quartzite', 
  'Realgar', 'Rhodolite', 'Rhodonite', 'Rhodochrosite', 'Rock Crystal', 'Rock Salt', 'Rubellite', 
  'Ruby', 'Rutile', 'Rhyolite', 'Sapphire', 'Sanidine', 'Scapolite', 'Schist', 'Scheelite', 
  'Schorl', 'Serpentine', 'Selenite', 'Serpentinite', 'Sinhalite', 'Sillimanite', 'Smithsonite', 
  'Soapstone', 'Sodalite', 'Spessartine', 'Sphalerite', 'Slate', 'Sphene', 'Spodumene', 'Spinel', 
  'Sugilite', 'Sunstone', 'Staurolite', 'Taaffeite', 'Tanzanite', 'Talc', 'Thomsonite', 
  'Tiger\'s Eye', 'Travertine', 'Tourmaline', 'Tremolite', 'Turquoise', 'Ulexite', 'Topaz', 
  'Variscite', 'Uvarovite', 'Vivianite', 'Vesuvianite', 'Wavellite', 'Witherite', 'Willemite', 
  'Zircon', 'Wulfenite', 'Zincite', 'Zoisite', 'Eudialyte', 'Howlite'
];

export function createGemstoneIdentificationPrompt(): string {
  return `
You are an expert gemologist analyzing a gemstone image. Your task is to identify the gemstone from a specific database of known stones.

IMPORTANT: You must ONLY identify stones from this exact list of ${GEMSTONE_DATABASE_LIST.length} gemstones in our database:

${GEMSTONE_DATABASE_LIST.join(', ')}

Analyze the uploaded gemstone image and provide identification based on:

1. **Color Analysis**: Primary and secondary colors, color distribution, saturation
2. **Transparency**: Transparent, translucent, or opaque
3. **Luster**: Vitreous, metallic, pearly, silky, adamantine, resinous, dull
4. **Crystal Structure**: Crystal habit, shape, form (if visible)
5. **Surface Features**: Texture, inclusions, patterns, striations
6. **Physical Properties**: Apparent hardness indicators, cleavage, fracture

**Output Requirements:**
Respond ONLY with a valid JSON object in this exact format:

{
  "primary_match": {
    "stone_name": "Exact name from the database list",
    "confidence": 0.85
  },
  "alternative_matches": [
    {
      "stone_name": "Alternative 1 from database list", 
      "confidence": 0.72
    },
    {
      "stone_name": "Alternative 2 from database list",
      "confidence": 0.68
    }
  ],
  "reasoning": "Brief explanation of why this identification was made"
}

**Critical Rules:**
- Stone names MUST match exactly from the provided database list
- Confidence scores between 0.0 and 1.0
- Primary match confidence should be highest
- Provide 1-3 alternative matches if uncertain
- If you cannot confidently identify the stone, use the closest matches from the database
- Do not suggest stones not in the database list
- Do not use generic terms - use specific stone names from the list

Analyze the image now and provide your identification.
`;
}

export function getGemstonePromptWithList(): { prompt: string; stoneList: string[] } {
  return {
    prompt: createGemstoneIdentificationPrompt(),
    stoneList: GEMSTONE_DATABASE_LIST
  };
}