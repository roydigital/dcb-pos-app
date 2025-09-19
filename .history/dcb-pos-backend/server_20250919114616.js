const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { seedMenuData } = require('../models/menuItem');

// Initialize the Express app
const app = express();
const PORT = 3005;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the parent directory (where index.html is)
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api', require('./routes'));

// A simple test route to check if the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the DCB POS Backend API!');
});

// Start listening for requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
