const mongoose = require('mongoose');
const logger = require('../logger/logger');
const { DB_URI } = require('./env');
const connectToDb = async () => {
  try {
    await mongoose.connect(DB_URI);
    logger.info('Connected To DB');
  } catch (err) {
    logger.info('Error Connecting With DB' + err);
  }
};
module.exports = connectToDb;
