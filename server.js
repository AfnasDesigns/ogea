require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const { connectDB } = require('./config/db');

const { MongoStore } = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware to ensure DB connection is ready before processing requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection middleware error:', error.message);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Database connection failed. Please ensure MONGODB_URI is correctly configured.',
            details: error.message 
        });
    }
});

// Session management (serverless ready with MongoDB)
const sessionStore = process.env.MONGODB_URI 
    ? MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    })
    : undefined; // Fallback to MemoryStore if env var is missing

app.use(session({
    secret: process.env.SESSION_SECRET || 'ogea_secret_2026',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true
    }
}));

// ==================== STATIC FILES ====================
// Only serve static files via Express in local Node.js mode.
// On Netlify, the CDN handles this automatically and bundling them crashes the deploy.
if (!process.env.NETLIFY && process.env.NODE_ENV !== 'production') {
    const pubDir = 'public';
    const upDir = 'uploads';
    app.use(express.static(path.join(process.cwd(), pubDir)));
    app.use('/uploads', express.static(path.join(process.cwd(), upDir)));
}

// ==================== API ROUTES ====================
// In Netlify functions, the base path is usually /.netlify/functions/api
// But we want our routes to work seamlessly. We can mount them under /api
const apiRouter = express.Router();

apiRouter.use('/achievements', require('./routes/achievements'));
apiRouter.use('/programs', require('./routes/programs'));
apiRouter.use('/posters', require('./routes/posters'));
apiRouter.use('/publications', require('./routes/publications'));
apiRouter.use('/users', require('./routes/users'));
apiRouter.use('/config', require('./routes/config'));
apiRouter.use('/auth', require('./routes/auth'));
apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'OGEA Portal API is running', timestamp: new Date().toISOString() });
});

// Mount router at /api for local dev
app.use('/api', apiRouter);
// Mount router at /.netlify/functions/api for Netlify
app.use('/.netlify/functions/api', apiRouter);

module.exports = app; // Export for serverless-http

// ==================== START SERVER (LOCAL ONLY) ====================
if (require.main === module) {
    async function startServer() {
        try {
            await connectDB();
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
}
