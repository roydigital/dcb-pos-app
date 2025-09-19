const express = require('express');
const router = express.Router();
const { Recipe } = require('../models');

// POST to create or update a recipe for a menu item
router.post('/', async (req, res) => {
    try {
        const { menuItemId, ingredients } = req.body;
        let recipe = await Recipe.findOne({ menuItem: menuItemId });

        if (recipe) {
            // Update existing recipe
            recipe.ingredients = ingredients;
        } else {
            // Create new recipe
            recipe = new Recipe({
                menuItem: menuItemId,
                ingredients: ingredients
            });
        }

        const savedRecipe = await recipe.save();
        res.status(201).json(savedRecipe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET the recipe for a specific menu item
router.get('/:menuItemId', async (req, res) => {
    try {
        const recipe = await Recipe.findOne({ menuItem: req.params.menuItemId })
            .populate('ingredients.inventoryItem');
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
