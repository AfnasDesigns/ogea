const serverless = require('serverless-http');
const { connectDB } = require('../config/db');

// Connect to MongoDB once per function container cold start
// Wrap in try-catch to prevent unhandled rejections from crashing the container with a 502
(async () => {
    try {
        await connectDB();
    } catch (err) {
        console.error("Netlify Function DB Connection Error:", err.message);
    }
})();
const app = require('../server');

module.exports.handler = serverless(app);
