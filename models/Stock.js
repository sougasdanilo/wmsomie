// src/models/Stock.js
import mongoose from 'mongoose';

const StockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  quantity: { type: Number, default: 0 },
}, { timestamps: true });

StockSchema.index({ product: 1, location: 1 }, { unique: true });

export default mongoose.model('Stock', StockSchema);