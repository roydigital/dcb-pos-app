const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/dcb-pos');
        console.log('Successfully connected to MongoDB');
    } catch (err) {
        console.error('Connection error', err);
        process.exit(1); // Exit process with failure
    }
};

