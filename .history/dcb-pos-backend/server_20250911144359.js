const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize the Express app
const app = express();
const PORT = 3002;

// Connect to MongoDB (cleaned up connection options)
mongoose.connect('mongodb://localhost:27017/dcb-pos')
.then(() => console.log('Successfully connected to MongoDB'))
.catch(err => console.error('Connection error', err));

// Define the schema for an order
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
  paymentMode: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'delivered'],
    default: 'active',
  },
}, { timestamps: true });

// Create a model from the schema
const Order = mongoose.model('Order', orderSchema);

// Middleware
app.use(cors()); 
app.use(express.json()); 

// --- API ROUTES ---

// A simple test route to check if the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the DCB POS Backend API!');
});

// Route for submitting orders
app.post('/api/orders', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const lastOrder = await Order.findOne({ createdAt: { $gte: startOfToday } })
      .sort({ createdAt: -1 });

    let newOrderNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      newOrderNumber = lastOrder.orderNumber + 1;
    }

    const newOrder = new Order({
      ...req.body,
      orderNumber: newOrderNumber,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ message: 'Failed to save order' });
  }
});

// Route to get today's ACTIVE orders
app.get('/api/orders/today', async (req, res) => {
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
app.patch('/api/orders/:id/deliver', async (req, res) => {
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

// Route to get a sales report for today
app.get('/api/reports/today', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const deliveredOrders = await Order.find({
      createdAt: { $gte: startOfToday },
      status: 'delivered',
    });

    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = deliveredOrders.length;
    const paymentBreakdown = deliveredOrders.reduce((acc, order) => {
      const mode = order.paymentMode.toLowerCase();
      if (!acc[mode]) {
        acc[mode] = 0;
      }
      acc[mode] += order.totalAmount;
      return acc;
    }, {});

    res.json({
      totalRevenue,
      orderCount,
      paymentBreakdown,
      orders: deliveredOrders,
    });
  } catch (error) {
    console.error("Error fetching today's sales report:", error);
    res.status(500).json({ message: "Failed to fetch today's sales report" });
  }
});


// Start listening for requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});