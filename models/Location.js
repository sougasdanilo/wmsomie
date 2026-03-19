// src/models/Location.js
import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true }, // ex: AA1, AA2, AB1...
  description: String,
  omieId: String,
  aisle: { type: String, required: true }, // ex: AA, AB, AC
  position: { type: Number, required: true }, // ex: 1, 2, 3
  level: { type: Number, default: 1 }, // nível vertical (opcional)
  zone: String, // zona do armazém (opcional)
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

LocationSchema.index({ omieId: 1 });
LocationSchema.index({ aisle: 1, position: 1 });
LocationSchema.index({ code: 1 });

// Middleware para gerar código automaticamente baseado em aisle, position e level
LocationSchema.pre('save', function(next) {
  if (!this.code && this.aisle && this.position) {
    this.code = this.level > 1 ? `${this.aisle}${this.position}-${this.level}` : `${this.aisle}${this.position}`;
  }
  next();
});

export default mongoose.model('Location', LocationSchema);