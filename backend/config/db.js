// db.js
const mongoose = require('mongoose');

// MongoDB URI (change it to your actual MongoDB connection string)
const mongoURI = 'mongodb+srv://adityajogdand15_db_user:dDedJQWmdHuWh2hf@intranettesting.7wfdu6i.mongodb.net/?appName=IntraNetTesting'; // Example connection string

const connectDB = async () => {
    try {
        // Connect to MongoDB without the deprecated options
        await mongoose.connect(mongoURI);

        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure code
    }
};

module.exports = connectDB;
