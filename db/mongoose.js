const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

async function connect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = { connect };

