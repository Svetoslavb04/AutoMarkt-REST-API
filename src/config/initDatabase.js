const envVariables = require('./env-variables.json');

const connectionString = envVariables[process.env['NODE_ENV']].DB_CONNECTION_STRING;

const mongoose = require('mongoose');

exports.connectDatabase = mongoose.connect(connectionString);