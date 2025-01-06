const mongoose = require('mongoose');

const connectToDatabase = async (uri) => {
    try {
        console.log('Connecting to', uri);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectToDatabase;