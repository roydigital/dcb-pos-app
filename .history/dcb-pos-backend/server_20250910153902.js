const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize the Express app
const app = express();
const PORT = 3001;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dcb-pos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Successfully connected to MongoDB'))
.catch(err => console.error('Connection error', err));

// Define the schema for an order
const orderSchema = new mongoose.Schema({
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
// Start listening for requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
