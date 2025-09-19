const express = require('express');
const router = express.Router();
const { Order } = require('../models');

// Route to get a sales report for a given date range
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let start;
    let end;

    if (startDate && endDate) {
      // Both dates provided
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else if (startDate) {
      // Only start date provided, report for a single day
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(startDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // No dates provided, default to today
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

