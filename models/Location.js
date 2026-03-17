// src/models/Location.js
import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true }, // ex: A01-B02-C03
  description: String,
}, { timestamps: true });

export default mongoose.model('Location', LocationSchema);