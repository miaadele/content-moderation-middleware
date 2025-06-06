// handle database connection

const mongoose = require('mongoose');
require('dotenv').config(); 

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
    //  useNewUrlParser: true,
    //  useUnifiedTopology: true,
    dbName: 'linkedin_scraper', 
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

