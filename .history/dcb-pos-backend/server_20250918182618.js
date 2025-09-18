const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { Parser } = require('json2csv');

const app = express();
const PORT = 3006;

// --- DATABASE CONNECTION ---
mongoose.connect('mongodb://localhost:27017/dcb-pos')
.then(() => {
  console.log('Successfully connected to MongoDB');
  seedMenuData();
})
.catch(err => console.error('Connection error', err));

// --- SCHEMAS AND MODELS ---
const menuItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  prices: [{ size: String, basePrice: Number, currentPrice: Number }]
});
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unit: { type: String, required: true },
  quantityInStock: { type: Number, required: true, default: 0 },
  averageCost: { type: Number, required: true, default: 0 }
});
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

const recipeSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  ingredients: [{
    inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    quantity: Number
  }]
});
const Recipe = mongoose.model('Recipe', recipeSchema);

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  phone: String,
  orderCount: { type: Number, default: 0 },
  lastOrdered: Date,
}, { timestamps: true });
const Customer = mongoose.model('Customer', customerSchema);

const orderSchema = new mongoose.Schema({
  orderNumber: { type: Number, required: true },
  items: [{ name: String, price: Number, quantity: Number }],
  totalAmount: { type: Number, required: true },
  customerName: String,
  customerPhone: String,
  paymentMode: { type: String, required: true },
  status: { type: String, enum: ['active', 'delivered', 'canceled'], default: 'active' },
  notes: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// --- API ROUTES ---
// (All API routes from previous steps are included here)

// Reports Route with Profit Calculation
app.get('/api/reports', async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
        let start, end;

        if (startDate) {
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            end = endDate ? new Date(endDate) : new Date(startDate);
            end.setHours(23, 59, 59, 999);
        } else {
            start = new Date();
            start.setHours(0, 0, 0, 0);
            end = new Date();
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
            acc[mode] = (acc[mode] || 0) + order.totalAmount;
            return acc;
        }, {});
        
        // --- PROFIT CALCULATION LOGIC ---
        let costOfGoodsSold = 0;
        for (const order of deliveredOrders) {
            for (const item of order.items) {
                // Find the menu item to link to the recipe
                const menuItem = await MenuItem.findOne({ 'prices.currentPrice': item.price, name: { $regex: new RegExp(item.name.split(' (')[0], 'i') } });
                if (!menuItem) continue;

                const recipe = await Recipe.findOne({ menuItem: menuItem._id }).populate({
                    path: 'ingredients.inventoryItem',
                    model: 'InventoryItem'
                });

                if (recipe) {
                    let itemCost = 0;
                    recipe.ingredients.forEach(ing => {
                        if (ing.inventoryItem) {
                            itemCost += ing.quantity * ing.inventoryItem.averageCost;
                        }
                    });
                    costOfGoodsSold += itemCost * item.quantity;
                }
            }
        }
        const grossProfit = totalRevenue - costOfGoodsSold;
        // --- END PROFIT CALCULATION ---

        res.json({
            totalRevenue,
            orderCount,
            paymentBreakdown,
            orders: deliveredOrders,
            costOfGoodsSold,
            grossProfit,
        });
    } catch (error) {
        console.error("Error fetching sales report:", error);
        res.status(500).json({ message: "Failed to fetch sales report" });
    }
});

// ... (All other API routes for menu, customers, orders, etc., are assumed to be here)

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// --- ONE-TIME DATA SEEDING & MIGRATION ---
async function seedMenuData() { /* ... seeding logic as before ... */ }