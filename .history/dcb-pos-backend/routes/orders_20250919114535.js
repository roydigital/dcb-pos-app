const express = require('express');
const router = express.Router();
const { Order, Customer, MenuItem, Recipe, InventoryItem } = require('../models');

// Route for submitting orders
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, ...orderData } = req.body;
    let customerId = null;

    // If customer name is provided, find or create the customer
    if (customerName) {
        const customer = await Customer.findOneAndUpdate(
            { name: customerName },
            { 
                $set: { name: customerName, phone: customerPhone, lastOrdered: new Date() },
                $inc: { orderCount: 1 }
            },
            { upsert: true, new: true }
        );
        customerId = customer._id;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const lastOrder = await Order.findOne({ createdAt: { $gte: startOfToday } })
      .sort({ createdAt: -1 });

    let newOrderNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      newOrderNumber = lastOrder.orderNumber + 1;
    }

    const newOrder = new Order({
      ...orderData,
      customerName,
      customerPhone,
      customer: customerId, // Link the customer's ID
      orderNumber: newOrderNumber,
    });

    const savedOrder = await newOrder.save();

    // Deduct inventory based on the order
    for (const item of savedOrder.items) {
        const menuItem = await MenuItem.findOne({ name: item.name });
        if (menuItem) {
            const recipe = await Recipe.findOne({ menuItem: menuItem._id });
            if (recipe) {
                for (const ingredient of recipe.ingredients) {
                    await InventoryItem.updateOne(
                        { _id: ingredient.inventoryItem },
                        { $inc: { quantityInStock: -ingredient.quantity * item.quantity } }
                    );
                }
            }
        }
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ message: 'Failed to save order' });
  }
});

// Route to get today's ACTIVE orders
router.get('/today', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: startOfToday },
      status: 'active',
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching today\'s orders:', error);
    res.status(500).json({ message: 'Failed to fetch today\'s orders' });
  }
});

// Route to mark an order as delivered
router.patch('/:id/deliver', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'delivered' },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Route to mark an order as canceled
router.patch('/:id/cancel', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'canceled' },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});

module.exports = router;
