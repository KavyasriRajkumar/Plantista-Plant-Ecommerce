import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // snapshot at time of order
    price: { type: Number, required: true }, // snapshot, so later price changes don't rewrite history
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    shippingAddress: {
      street: String,
      city: String,
      pincode: String,
    },
    couponCode: { type: String, default: null },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Human-friendly reference shown in the UI, derived from the Mongo id.
orderSchema.virtual('orderNumber').get(function orderNumber() {
  return `ORD-${String(this._id).slice(-6).toUpperCase()}`;
});

export default mongoose.model('Order', orderSchema);
