const { MongoClient } = require('mongodb');

let db = null;
let client = null;

async function connectDB() {
    if (db) return db;

    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        client = new MongoClient(uri);
        await client.connect();

        // Get the database name from the URI or default to 'ogea'
        db = client.db('ogea');

        // Test the connection
        await db.command({ ping: 1 });
        console.log('✅ Connected to MongoDB Atlas successfully!');
        console.log('📦 Database: ogea');

        return db;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return db;
}

function getClient() {
    return client;
}

module.exports = { connectDB, getDB, getClient };
