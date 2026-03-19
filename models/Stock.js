// src/models/Stock.js
import mongoose from 'mongoose';

const StockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  quantity: { type: Number, default: 0, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

StockSchema.index({ product: 1, location: 1 }, { unique: true });
StockSchema.index({ location: 1, quantity: 1 });

StockSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  if (this.reservedQuantity > this.quantity) {
    return next(new Error('Reserved quantity cannot exceed total quantity'));
  }
  next();
});

export default mongoose.model('Stock', StockSchema);