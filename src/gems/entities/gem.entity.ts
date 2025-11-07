import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GemDocument = Gem & Document;

// Nested schemas for complex objects
@Schema({ _id: false })
export class Tag {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  emoji: string;
}

@Schema({ _id: false })
export class Badge {
  @Prop({ required: true })
  text: string;
}

@Schema({ _id: false })
export class Rarity {
  @Prop({ required: true })
  grade: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Badge, required: true })
  badge: Badge;
}

@Schema({ _id: false })
export class QuickFacts {
  @Prop()
  'Crystal System'?: string;

  @Prop()
  'Transparency'?: string;

  @Prop()
  'Color'?: string;

  @Prop()
  'Classification'?: string;

  @Prop()
  'Primary Uses'?: string;

  @Prop()
  'Hardness'?: string;
}

@Schema({ _id: false })
export class CurrentMarketRange {
  @Prop({ required: true })
  price_range: string;

  @Prop({ required: true })
  info: string;
}

@Schema({ _id: false })
export class ProfileGrade {
  @Prop({ required: true })
  value: string;

  @Prop({ required: true })
  grade: string;
}

@Schema({ _id: false })
export class StoneProfile {
  @Prop({ type: ProfileGrade, required: true })
  rarity: ProfileGrade;

  @Prop({ type: ProfileGrade, required: true })
  durability: ProfileGrade;

  @Prop({ type: ProfileGrade, required: true })
  significance: ProfileGrade;

  @Prop({ type: ProfileGrade, required: true })
  aesthetics: ProfileGrade;

  @Prop({ type: ProfileGrade, required: true })
  overall_profile: ProfileGrade;
}

@Schema({ _id: false })
export class PriceRange {
  @Prop({ required: true })
  min: number;

  @Prop({ required: true })
  max: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  unit: string;
}

@Schema({ _id: false })
export class Price {
  @Prop({ type: PriceRange, required: true })
  rough: PriceRange;

  @Prop({ type: PriceRange, required: true })
  tumbled: PriceRange;

  @Prop({ type: PriceRange, required: true })
  gem: PriceRange;
}

@Schema({ _id: false })
export class Overview {
  @Prop({ type: Rarity, required: true })
  rarity: Rarity;

  @Prop({ type: QuickFacts, required: true })
  quick_facts: QuickFacts;

  @Prop({ type: CurrentMarketRange, required: true })
  current_market_range: CurrentMarketRange;

  @Prop({ required: true })
  description: string;

  @Prop({ type: StoneProfile, required: true })
  stone_profile: StoneProfile;

  @Prop({ type: Price, required: true })
  price: Price;
}

@Schema({ _id: false })
export class IdentificationItem {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  image: string;
}

@Schema({ _id: false })
export class HowToIdentify {
  @Prop({ type: IdentificationItem, required: true })
  color: IdentificationItem;

  @Prop({ type: IdentificationItem, required: true })
  luster: IdentificationItem;
}

@Schema({ _id: false })
export class SelectionIdentification {
  @Prop({ required: true })
  how_to_select: string;

  @Prop({ type: HowToIdentify, required: true })
  how_to_identify: HowToIdentify;
}

@Schema({ _id: false })
export class Location {
  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  region: string;
}

@Schema({ _id: false })
export class GeographicalOccurrence {
  @Prop({ type: [Location], required: true })
  locations: Location[];
}

@Schema({ _id: false })
export class FAQ {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;
}

@Schema({ _id: false })
export class PhysicalProperties {
  @Prop({ required: true })
  crystal_system: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  luster: string;
}

@Schema({ _id: false })
export class ChemicalProperties {
  @Prop({ required: true })
  classification: string;

  @Prop({ required: true })
  formula: string;

  @Prop({ type: [String], required: true })
  elements_listed: string[];
}

@Schema({ _id: false })
export class Meanings {
  @Prop({ type: PhysicalProperties, required: true })
  physical_properties: PhysicalProperties;

  @Prop({ type: ChemicalProperties, required: true })
  chemical_properties: ChemicalProperties;

  @Prop({ required: true })
  formation: string;

  @Prop({ required: true })
  age_distribution: string;

  @Prop({ required: true })
  durability: string;

  @Prop({ required: true })
  scratch_resistance: string;

  @Prop({ required: true })
  toughness: string;

  @Prop({ required: true })
  stability: string;
}

@Schema({ _id: false })
export class QualityItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;
}

@Schema({ _id: false })
export class Properties {
  @Prop({ type: [String], required: true })
  healing_properties: string[];

  @Prop({ type: [QualityItem], required: true })
  qualities: QualityItem[];

  @Prop({ type: [QualityItem], required: true })
  chakras: QualityItem[];

  @Prop({ type: [QualityItem], required: true })
  zodiac_signs: QualityItem[];

  @Prop({ type: [QualityItem], required: true })
  elements: QualityItem[];
}

@Schema({ _id: false })
export class HistoryLore {
  @Prop({ required: true })
  history: string;

  @Prop({ required: true })
  mythology: string;

  @Prop({ required: true })
  lore: string;
}

@Schema({ _id: false })
export class Caution {
  @Prop({ required: true })
  warning: string;

  @Prop({ required: true })
  information: string;

  @Prop({ required: true })
  short_description: string;
}

@Schema({ _id: false })
export class CareTip {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  tip: string;
}

@Schema({ _id: false })
export class SimilarStone {
  @Prop({ required: true })
  stone_name: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  image: string;

  @Prop({ type: [String], required: true })
  differences: string[];
}

@Schema({ _id: false })
export class More {
  @Prop({ type: Caution, required: true })
  caution: Caution;

  @Prop({ required: true })
  usage: string;

  @Prop({ type: [CareTip], required: true })
  care_tips: CareTip[];

  @Prop({ type: [SimilarStone], required: true })
  similar_stones: SimilarStone[];
}

@Schema({ _id: false })
export class Sections {
  @Prop({ type: Overview, required: true })
  overview: Overview;

  @Prop({ type: SelectionIdentification, required: true })
  selection_identification: SelectionIdentification;

  @Prop({ type: GeographicalOccurrence, required: true })
  geographical_occurrence: GeographicalOccurrence;

  @Prop({ type: [FAQ], required: true })
  people_often_ask: FAQ[];

  @Prop({ type: Meanings, required: true })
  meanings: Meanings;

  @Prop({ type: Properties, required: true })
  properties: Properties;

  @Prop({ type: HistoryLore, required: true })
  history_lore: HistoryLore;

  @Prop({ type: More, required: true })
  more: More;
}

// Main Gem Schema
@Schema({ 
  timestamps: true,
  collection: 'gems'
})
export class Gem {
  _id: Types.ObjectId;
  
  id: string;

  @Prop({ required: true, maxlength: 255 })
  stone_name: string;

  @Prop({ type: [String], required: true })
  albums: string[];

  @Prop({ maxlength: 255 })
  variety_of?: string;

  @Prop({ type: [String] })
  known_as?: string[];

  @Prop({ type: [Tag], required: true })
  tags: Tag[];

  @Prop({ type: Sections, required: true })
  sections: Sections;

  // Timestamps are automatically handled by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export const GemSchema = SchemaFactory.createForClass(Gem);

// Create indexes for better performance
GemSchema.index({ stone_name: 1 });
GemSchema.index({ 'tags.name': 1 });
GemSchema.index({ variety_of: 1 });
GemSchema.index({ known_as: 1 });