const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize the Express app
const app = express();
const PORT = 3002;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dcb-pos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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
}, { timestamps: true });

// Create a model from the schema
const Order = mongoose.model('Order', orderSchema);

// Middleware
// Enable Cross-Origin Resource Sharing (CORS) so our front-end can talk to this server
app.use(cors()); 
// Enable the server to accept and parse JSON in the body of requests
app.use(express.json()); 

// A simple test route to check if the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the DCB POS Backend API!');
});

// Route for submitting orders
app.post('/api/orders', async (req, res) => {
  try {
    // Determine the start of the current day
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Find the most recent order of the day to determine the new order number
    const lastOrder = await Order.findOne({ createdAt: { $gte: startOfToday } })
      .sort({ createdAt: -1 });

    let newOrderNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      newOrderNumber = lastOrder.orderNumber + 1;
    }

    // Create a new order instance with the generated order number
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

// Start listening for requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
