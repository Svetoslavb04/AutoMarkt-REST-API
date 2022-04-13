const connectionString = process.env.DB_CONNECTION_STRING;

const mongoose = require('mongoose');

exports.connectDatabase = mongoose.connect(connectionString);