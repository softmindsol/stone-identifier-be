// Enhanced alternative match for simplified response
class AlternativeMatchDto {
  name: string;
  confidence: number;
  id?: string;
  albums?: string[];
}

class TagDto {
  name: string;
  emoji: string;
}

class RarityDto {
  grade: string;
  label: string;
  description: string;
  badge: {
    text: string;
  };
}

class QuickFactsDto {
  'Crystal System'?: string;
  'Transparency'?: string;
  'Color'?: string;
  'Classification'?: string;
  'Primary Uses'?: string;
  'Hardness'?: string;
}

// Overview nested object
class OverviewDto {
  current_market_range: {
    price_range: string;
    info: string;
  };
  description: string;
  stone_profile: {
    rarity: { value: string; grade: string; };
    durability: { value: string; grade: string; };
    significance: { value: string; grade: string; };
    aesthetics: { value: string; grade: string; };
    overall_profile: { value: string; grade: string; };
  };
  price: {
    rough: { min: number; max: number; currency: string; unit: string; };
    tumbled: { min: number; max: number; currency: string; unit: string; };
    gem: { min: number; max: number; currency: string; unit: string; };
  };
  how_to_select: string;
  how_to_identify: {
    color: { text: string; image: string; };
    luster: { text: string; image: string; };
  };
  geographical_occurrence: {
    locations: Array<{ country: string; region: string; }>;
  };
  people_often_ask: Array<{ question: string; answer: string; }>;
}

// Meanings object
class MeaningsDto {
  physical_properties: {
    crystal_system: string;
    color: string;
    luster: string;
  };
  chemical_properties: {
    classification: string;
    formula: string;
    elements_listed: string[];
  };
  formation: string;
  age_distribution: string;
  durability: string;
  scratch_resistance: string;
  toughness: string;
  stability: string;
}

// Properties and Lore combined object
class PropertiesAndLoreDto {
  healing_properties: string[];
  qualities: Array<{ name: string; icon: string; }>;
  chakras: Array<{ name: string; icon: string; }>;
  zodiac_signs: Array<{ name: string; icon: string; }>;
  elements: Array<{ name: string; icon: string; }>;
  history: string;
  mythology: string;
  lore: string;
}

// More object
class MoreDto {
  caution: {
    warning: string;
    information: string;
    short_description: string;
  };
  usage: string;
  care_tips: Array<{ title: string; tip: string; }>;
  similar_stones: Array<{
    stone_name: string;
    title: string;
    description: string;
    image: string;
    differences: string[];
  }>;
}

class MetadataDto {
  model_used: string;
  analysis_timestamp: string;
  image_quality_score: number;
}

export class GemstoneIdentificationResponseDto {
  // Main response data (root level)
  name: string;
  confidence: number;
  variety_of?: string | null;
  known_as?: string[];
  albums?: string[];
  tags?: TagDto[];
  rarity?: RarityDto;
  quick_facts?: QuickFactsDto;
  
  // Alternative matches (simplified)
  alternative_matches: AlternativeMatchDto[];
  
  // Nested objects with detailed information
  overview?: OverviewDto;
  meanings?: MeaningsDto;
  properties_and_lore?: PropertiesAndLoreDto;
  more?: MoreDto;
  
  // AI metadata
  reasoning: string;
  metadata: MetadataDto;
  
  // Status for not found cases
  status?: 'found' | 'not_found';
}