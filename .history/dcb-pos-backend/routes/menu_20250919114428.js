const express = require('express');
const router = express.Router();
const { MenuItem } = require('../models');

// GET all menu items
router.get('/', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Failed to fetch menu items' });
    }
});

// POST a new menu item
router.post('/', async (req, res) => {
    try {
        const newItem = new MenuItem(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ message: 'Failed to create menu item' });
    }
});

// DELETE a menu item
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await MenuItem.findByIdAndDelete(id);
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ message: 'Failed to delete menu item' });
    }
});

// PUT (update) a menu item
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ message: 'Failed to update menu item' });
    }
});

// POST route for bulk price updates
router.post('/bulk-update-prices', async (req, res) => {
    const { percentage, direction } = req.body;

    if (!percentage || !direction || typeof percentage !== 'number' || percentage <= 0) {
        return res.status(400).json({ message: 'Invalid percentage or direction provided.' });
    }

    try {
        const multiplier = direction === 'increase' ? 1 + (percentage / 100) : 1 - (percentage / 100);
        
        const menuItems = await MenuItem.find();

        for (const item of menuItems) {
            for (const priceInfo of item.prices) {
                priceInfo.price = Math.round(priceInfo.price * multiplier);
            }
            await item.save();
        }

        res.json({ message: 'Prices updated successfully for all menu items.' });
    } catch (error) {
        console.error('Error during bulk price update:', error);
        res.status(500).json({ message: 'Failed to update prices.' });
    }
});

module.exports = router;
