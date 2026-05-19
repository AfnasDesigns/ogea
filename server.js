require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session management (replaces localStorage session)
app.use(session({
    secret: process.env.SESSION_SECRET || 'ogea_secret_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true
    }
}));

// ==================== STATIC FILES ====================
// Serve the frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== API ROUTES ====================
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/programs', require('./routes/programs'));
app.use('/api/posters', require('./routes/posters'));
app.use('/api/publications', require('./routes/publications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/config', require('./routes/config'));
app.use('/api/auth', require('./routes/auth'));

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'OGEA Portal API is running', timestamp: new Date().toISOString() });
});

// ==================== START SERVER ====================
async function startServer() {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Then start Express server
        app.listen(PORT, () => {
            console.log('');
            console.log('🎓 =============================================');
            console.log('🎓  OGEA OUTREACH PORTAL - SERVER RUNNING');
            console.log('🎓  Darul Hidaya Dawa College');
            console.log('🎓 =============================================');
            console.log(`🌐 Portal:  http://localhost:${PORT}`);
            console.log(`🔐 Admin:   http://localhost:${PORT}/admin-login.html`);
            console.log(`📡 API:     http://localhost:${PORT}/api/health`);
            console.log('🎓 =============================================');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
