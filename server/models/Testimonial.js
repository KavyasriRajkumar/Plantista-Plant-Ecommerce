import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '', trim: true }, // shown under the name, e.g. the customer's city
    quote: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default mongoose.model('Testimonial', testimonialSchema);
