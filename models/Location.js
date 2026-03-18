// src/models/Location.js
import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true }, // ex: A01-B02-C03
  description: String,
  omieId: String,
}, { timestamps: true });

LocationSchema.index({ omieId: 1 });

export default mongoose.model('Location', LocationSchema);