const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    required: true
  },
  items: [{
    name: String,
    price: Number,
    quantity: Number,
  }],
  totalAmount: { type: Number, required: true },
  customerName: String,
  customerPhone: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  paymentMode: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'delivered', 'canceled'],
    default: 'active',
  },
  notes: String,
}, { timestamps: true });

