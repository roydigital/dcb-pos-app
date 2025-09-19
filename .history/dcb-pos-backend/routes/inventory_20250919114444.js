const express = require('express');
const router = express.Router();
const { InventoryItem } = require('../models');

// GET all inventory items
router.get('/', async (req, res) => {
    try {
        const items = await InventoryItem.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new inventory item
router.post('/', async (req, res) => {
    const item = new InventoryItem({
        name: req.body.name,
        unit: req.body.unit,
        quantityInStock: req.body.quantityInStock,
        averageCost: req.body.averageCost
    });

    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT to update an inventory item's quantity and average cost
router.put('/:id/refill', async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        const { quantity, cost } = req.body;
        const totalCost = (item.averageCost * item.quantityInStock) + cost;
        const totalQuantity = item.quantityInStock + quantity;
        
        item.averageCost = totalCost / totalQuantity;
        item.quantityInStock = totalQuantity;

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

