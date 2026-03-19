// src/services/stockService.js
import Stock from '../models/Stock.js';
import mongoose from 'mongoose';

export async function adjustStock(productId, locationId, qtyChange, options = {}) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const stock = await Stock.findOne({ 
      product: productId, 
      location: locationId 
    }).session(session);

    if (!stock) {
      if (qtyChange < 0) {
        throw new Error('Stock not found - cannot deduct from non-existent stock');
      }
      
      const newStock = new Stock({ 
        product: productId, 
        location: locationId, 
        quantity: 0 
      });
      await newStock.save({ session });
      
      newStock.quantity += qtyChange;
      await newStock.save({ session });
      
      await session.commitTransaction();
      return newStock;
    }

    const availableQuantity = stock.quantity - (stock.reservedQuantity || 0);
    if (options.checkReserved && qtyChange < 0 && Math.abs(qtyChange) > availableQuantity) {
      throw new Error(`Insufficient stock. Available: ${availableQuantity}, Requested: ${Math.abs(qtyChange)}`);
    }

    if (stock.quantity + qtyChange < 0) {
      throw new Error(`Stock cannot be negative. Current: ${stock.quantity}, Change: ${qtyChange}`);
    }

    stock.quantity += qtyChange;
    await stock.save({ session });
    
    await session.commitTransaction();
    return stock;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}