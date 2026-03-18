// src/models/Movement.js
import mongoose from 'mongoose';

const MovementSchema = new mongoose.Schema({
  type: { type: String, enum: ['IN', 'OUT', 'TRANSFER'] },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  fromLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  toLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  quantity: Number,
  omieId: String,
  date: { type: Date, default: Date.now },
  description: String,
  syncedAt: Date,
}, { timestamps: true });

MovementSchema.index({ omieId: 1 });

export default mongoose.model('Movement', MovementSchema);