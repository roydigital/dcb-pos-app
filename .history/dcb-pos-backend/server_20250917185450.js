const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const path = require('path');

// Initialize the Express app
const app = express();
const PORT = 3004;

// Connect to MongoDB (cleaned up connection options)
mongoose.connect('mongodb://localhost:27017/dcb-pos')
.then(() => {
    console.log('Successfully connected to MongoDB');
    seedMenuData(); // Seed the menu data after connection
})
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
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  paymentMode: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'delivered'],
    default: 'active',
  },
}, { timestamps: true });

// Create a model from the schema
const Order = mongoose.model('Order', orderSchema);

// Define the schema for a menu item
const menuItemSchema = new mongoose.Schema({
    category: { type: String, required: true },
    name: { type: String, required: true },
    prices: [{
        size: String,
        price: Number
    }]
});

// Create a model from the schema
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// Define the schema for a customer
const customerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    phone: { type: String },
    orderCount: {
        type: Number,
        default: 0
    },
    lastOrdered: {
        type: Date
    }
}, { timestamps: true });

// Create a model from the schema
const Customer = mongoose.model('Customer', customerSchema);

// --- DATA SEEDING ---
// Function to seed initial menu data if the collection is empty
async function seedMenuData() {
    try {
        const count = await MenuItem.countDocuments();
        if (count === 0) {
            console.log('No menu items found. Seeding initial data...');
            const menuData = [
                { category: 'Tandoori Menu', name: 'Juicy Chicken Kebab', prices: [{ size: 'Half', price: 79 }, { size: 'Full', price: 149 }] },
                { category: 'Tandoori Menu', name: 'Minced Mutton Kebab', prices: [{ size: 'Half', price: 99 }, { size: 'Full', price: 179 }] },
                { category: 'Tandoori Menu', name: 'Spicy Chicken Tikka', prices: [{ size: 'Half', price: 119 }, { size: 'Full', price: 199 }] },
                { category: 'Tandoori Menu', name: 'Spicy Roasted Tangdi', prices: [{ size: 'Half', price: 89 }, { size: 'Full', price: 159 }] },
                { category: 'Tandoori Menu', name: 'Chicken Barbeque', prices: [{ size: 'Half', price: 129 }, { size: 'Full', price: 229 }] },
                { category: 'Tandoori Menu', name: 'Afghani Slurpy Tikka', prices: [{ size: 'Half', price: 139 }, { size: 'Full', price: 239 }] },
                { category: 'Tandoori Menu', name: 'Spicy Malai Chicken Tikka', prices: [{ size: 'Half', price: 139 }, { size: 'Full', price: 229 }] },
                { category: 'Fried Menu', name: 'Chicken Lollypop Spicy', prices: [{ size: 'Half', price: 169 }, { size: 'Full', price: 319 }] },
                { category: 'Fried Menu', name: 'Deep Fried Chicken', prices: [{ size: 'Half', price: 119 }, { size: 'Full', price: 199 }] },
                { category: 'Fried Menu', name: 'Fried Crispy Tangdi', prices: [{ size: 'Half', price: 69 }, { size: 'Full', price: 129 }] },
                { category: 'Fried Menu', name: 'Crispy Spicy Fried Chicken', prices: [{ size: 'Half', price: 79 }, { size: 'Full', price: 139 }] },
                { category: 'Fried Menu', name: 'Spicy Crispy Fingers', prices: [{ size: 'Half', price: 119 }, { size: 'Full', price: 199 }] },
                { category: 'Roll Menu', name: 'Spicy Chicken Tikka Roll', prices: [{ size: 'Half', price: 129 }, { size: 'Full', price: 219 }] },
                { category: 'Roll Menu', name: 'Juicy Chicken Kebab Roll', prices: [{ size: 'Half', price: 89 }, { size: 'Full', price: 169 }] },
                { category: 'Roll Menu', name: 'Afghani Slurpy Tikka Roll', prices: [{ size: 'Half', price: 149 }, { size: 'Full', price: 259 }] },
                { category: 'Roll Menu', name: 'Minced Mutton Kebab Roll', prices: [{ size: 'Half', price: 109 }, { size: 'Full', price: 199 }] },
                { category: 'Breads', name: 'Roomali', prices: [{ size: 'Standard', price: 12 }] }
            ];
            await MenuItem.insertMany(menuData);
            console.log('Menu data seeded successfully.');
        }
    } catch (error) {
        console.error('Error seeding menu data:', error);
    }
}


// Middleware
app.use(cors()); 
app.use(express.json()); 

// Serve static files from the parent directory (where index.html is)
app.use(express.static(path.join(__dirname, '..')));

// --- API ROUTES ---

// A simple test route to check if the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the DCB POS Backend API!');
});

// --- MENU API ROUTES ---

// GET all menu items
app.get('/api/menu', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Failed to fetch menu items' });
    }
});

// POST a new menu item
app.post('/api/menu', async (req, res) => {
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
app.delete('/api/menu/:id', async (req, res) => {
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
app.put('/api/menu/:id', async (req, res) => {
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
app.post('/api/menu/bulk-update-prices', async (req, res) => {
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


// --- CUSTOMER API ROUTES ---

// GET all customers
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ lastOrdered: -1 });
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Failed to fetch customers' });
    }
});

// GET route to export customers to CSV
app.get('/api/customers/export', async (req, res) => {
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
app.get('/api/customers/search', async (req, res) => {
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


// --- ORDER API ROUTES ---

// Route for submitting orders
app.post('/api/orders', async (req, res) => {
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

// Route to get a sales report for a given date range
app.get('/api/reports', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let start, end;

    if (startDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
    } else {
      // Default to the start of the current day if no start date is provided
      start = new Date();
      start.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // If no end date is provided, default to the end of the start date (for a single-day report)
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    }

    const deliveredOrders = await Order.find({
      createdAt: { $gte: start, $lte: end },
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
    console.error("Error fetching sales report:", error);
    res.status(500).json({ message: "Failed to fetch sales report" });
  }
});


// Start listening for requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
