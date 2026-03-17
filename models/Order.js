// src/models/Order.js
import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
});

const OrderSchema = new mongoose.Schema({
  omieId: { type: String, unique: true },
  status: {
    type: String,
    enum: ['PENDING', 'PICKING', 'DONE'],
    default: 'PENDING',
  },
  items: [OrderItemSchema],
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);