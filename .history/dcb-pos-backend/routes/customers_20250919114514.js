const express = require('express');
const router = express.Router();
const { Customer } = require('../models');
const { Parser } = require('json2csv');

// GET all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ lastOrdered: -1 });
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Failed to fetch customers' });
    }
});

// GET route to export customers to CSV
router.get('/export', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ lastOrdered: -1 });
        
        const fields = [
            { label: 'Name', value: 'name' },
            { label: 'Phone', value: 'phone' },
            { label: 'Customer Since', value: 'createdAt' },
            { label: 'Last Ordered', value: 'lastOrdered' },
            { label: 'Order Count', value: 'orderCount' }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(customers);

        res.header('Content-Type', 'text/csv');
        res.attachment('customers-export.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting customers:', error);
        res.status(500).json({ message: 'Failed to export customers' });
    }
});

// GET customers by search query
router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.q;
        if (!searchTerm) {
            return res.json([]);
        }

        const customers = await Customer.find({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { phone: { $regex: searchTerm, $options: 'i' } }
            ]
        }).limit(10);

        res.json(customers);
    } catch (error) {
        console.error('Error searching for customers:', error);
        res.status(500).json({ message: 'Failed to search for customers' });
    }
});

