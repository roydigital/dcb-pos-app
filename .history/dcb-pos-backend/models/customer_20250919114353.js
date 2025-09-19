const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    phone: { type: String },
    orderCount: {
        type: Number,
        default: 0
    },
    lastOrdered: {
        type: Date
    }
}, { timestamps: true });

