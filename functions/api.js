const serverless = require('serverless-http');
const app = require('../server');
const { connectDB } = require('../config/db');

// Connect to MongoDB once per function container cold start
connectDB();

module.exports.handler = serverless(app);
