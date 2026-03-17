// src/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, required: true },
  omieId: { type: String },
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);