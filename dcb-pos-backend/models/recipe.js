const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    menuItem: {
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    ingredients: [{
        inventoryItem: {
            type: Schema.Types.ObjectId,
            ref: 'InventoryItem'
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
