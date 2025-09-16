const express = require('express');
const cors = require('cors');

// Initialize the Express app
const app = express();
const PORT = 3001;

// Middleware
// Enable Cross-Origin Resource Sharing (CORS) so our front-end can talk to this server
app.use(cors()); 
// Enable the server to accept and parse JSON in the body of requests
app.use(express.json()); 

// A simple test route to check if the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the DCB POS Backend API!');
});

// A placeholder route for submitting orders. We will build this later.
app.post('/api/orders', (req, res) => {
  console.log('Received a new order submission:');
  console.log(req.body); // Log the data sent from the front-end
  
  // For now, just send a success response
  res.status(201).json({ 
    message: 'Order received successfully!', 
    orderData: req.body 
  });
});

// Start listening for requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
