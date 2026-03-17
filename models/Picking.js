// src/models/Picking.js
import mongoose from 'mongoose';

const PickingItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  quantity: Number,
});

const PickingSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  status: {
    type: String,
    enum: ['CREATED', 'IN_PROGRESS', 'DONE'],
    default: 'CREATED',
  },
  items: [PickingItemSchema],
}, { timestamps: true });

export default mongoose.model('Picking', PickingSchema);