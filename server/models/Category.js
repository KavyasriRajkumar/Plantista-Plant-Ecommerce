import mongoose from 'mongoose';

// `slug` is what products reference in their `category` field and what the
// frontend uses as the category id (e.g. /shop?category=indoor).
const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  {
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => ({ id: ret.slug, name: ret.name, image: ret.image }),
    },
  }
);

export default mongoose.model('Category', categorySchema);
