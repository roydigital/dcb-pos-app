const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    category: { type: String, required: true },
    name: { type: String, required: true },
    prices: [{
        size: String,
        price: Number
    }]
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
