const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    unit: {
        type: String,
        required: true
    },
    quantityInStock: {
        type: Number,
        required: true,
        default: 0
    },
    averageCost: {
        type: Number,
        required: true,
        default: 0
    }
});

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
