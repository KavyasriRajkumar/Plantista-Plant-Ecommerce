import mongoose from 'mongoose';

const careSchema = new mongoose.Schema(
  {
    water: String,
    sunlight: String,
    fertilizer: String,
  },
  { _id: false }
);

// Controlled vocabularies shared by the schema, the validator and the
// recommendation service so every layer agrees on allowed values.
export const REC_ENUMS = {
  sunlight: ['low', 'indirect', 'bright_indirect', 'direct'],
  environment: ['indoor', 'outdoor', 'both'],
  space: ['small', 'room', 'balcony', 'garden'],
  climate: ['hot_tropical', 'warm_humid', 'mild', 'cool'],
  watering: ['rare', 'moderate', 'frequent'],
  maintenance: ['beginner', 'low', 'moderate', 'advanced'],
  petSafety: ['safe', 'toxic', 'unknown'],
  triState: ['yes', 'no', 'unknown'],
};

const inSet = (values) => ({ validator: (arr) => arr.every((v) => values.includes(v)), message: 'Invalid value' });

// Recommendation attributes live in one sub-document so existing product
// fields are untouched. Multi-value fields list every condition the plant
// tolerates. Empty/absent = "not provided" (never treated as a match).
const recommendationSchema = new mongoose.Schema(
  {
    scientificName: { type: String, default: '', trim: true },
    sunlight: { type: [String], default: [], validate: inSet(REC_ENUMS.sunlight) },
    environment: { type: String, enum: [...REC_ENUMS.environment, null], default: null },
    space: { type: [String], default: [], validate: inSet(REC_ENUMS.space) },
    climate: { type: [String], default: [], validate: inSet(REC_ENUMS.climate) },
    watering: { type: String, enum: [...REC_ENUMS.watering, null], default: null },
    maintenance: { type: String, enum: [...REC_ENUMS.maintenance, null], default: null },
    sizeCm: {
      min: { type: Number, min: 0, default: null },
      max: { type: Number, min: 0, default: null },
    },
    petSafety: {
      status: { type: String, enum: REC_ENUMS.petSafety, default: 'unknown' },
      source: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    flowering: { type: String, enum: REC_ENUMS.triState, default: 'unknown' },
    decorativeFoliage: { type: String, enum: REC_ENUMS.triState, default: 'unknown' },
    edible: { type: String, enum: REC_ENUMS.triState, default: 'unknown' },
    soilNotes: { type: String, default: '' },
    careTips: { type: [String], default: [] },
    dataSource: { type: String, default: '' },
    reviewed: { type: Boolean, default: false }, // true once an admin has verified the data
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    bestSeller: { type: Boolean, default: false },
    images: { type: [String], default: [] },
    description: { type: String, default: '' },
    care: { type: careSchema, default: () => ({}) },
    recommendation: { type: recommendationSchema, default: () => ({}) },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Supports Shop's free-text search without a separate search service.
productSchema.index({ name: 'text', description: 'text' });

productSchema.index({ 'recommendation.environment': 1, price: 1 });

export default mongoose.model('Product', productSchema);
