const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const { syncCatalog } = require('./scripts/seedCatalog');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sri Kanaka Durga Pickles API is running',
    health: '/health',
    apiHealth: '/api/v1/health'
  });
});

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  try {
    const morgan = require('morgan');
    app.use(morgan('dev'));
  } catch (error) {
    console.warn('morgan is not installed; request logging disabled.');
  }
}

// Enable CORS
const cors = require('cors');
const allowedOrigins = new Set([
  'https://sridurgapickels-admin.onrender.com',
  'https://sridurgapickels.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  String(process.env.CLIENT_URL || '').trim(),
  String(process.env.ADMIN_URL || '').trim(),
].filter(Boolean));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin (curl, server-to-server, health checks).
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const rateLimit = require('express-rate-limit');
const isLocalhost = (ip = '') =>
  ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: process.env.NODE_ENV === 'production' ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production' && isLocalhost(req.ip),
  message: {
    success: false,
    message: 'Too many requests. Please try again shortly.'
  }
});
app.use(limiter);

// Security headers
const helmet = require('helmet');
app.use(helmet());

// Health checks
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'sri-kanaka-durga-pickles-server',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const statusCode = dbConnected ? 200 : 503;

  res.status(statusCode).json({
    success: dbConnected,
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    service: 'sri-kanaka-durga-pickles-server',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Return a clear response while DB is unavailable, instead of Mongoose buffer errors.
app.use('/api/v1', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please try again in a moment.',
    });
  }
  next();
});

// Routes
const tryMountRoute = (basePath, routeFile) => {
  const fullPath = path.join(__dirname, 'routes', routeFile);
  if (fs.existsSync(fullPath)) {
    try {
      app.use(basePath, require(`./routes/${routeFile}`));
    } catch (error) {
      console.warn(`Skipping ${basePath}: failed to load routes/${routeFile} (${error.message})`);
    }
  } else {
    console.warn(`Skipping ${basePath}: missing routes/${routeFile}`);
  }
};

tryMountRoute('/api/v1/auth', 'authRoutes.js');
tryMountRoute('/api/v1/products', 'productRoutes.js');
tryMountRoute('/api/v1/categories', 'categoryRoutes.js');
tryMountRoute('/api/v1/cart', 'cartRoutes.js');
tryMountRoute('/api/v1/wishlist', 'wishlistRoutes.js');
tryMountRoute('/api/v1/orders', 'orderRoutes.js');
tryMountRoute('/api/v1/support', 'supportRoutes.js');
tryMountRoute('/api/v1/admin', 'adminRoutes.js');

// Error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

const ensureAdminUser = async () => {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');

  if (!email || !password) {
    return;
  }

  const existing = await User.findOne({ email });

  if (existing) {
    let changed = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      changed = true;
    }
    // Keep admin password in sync with .env for local/dev reliability.
    existing.password = password;
    changed = true;

    if (changed) {
      await existing.save();
      console.log(`Admin user synced: ${email}`);
    }
    return;
  }

  await User.create({
    name: 'Admin',
    email,
    password,
    role: 'admin',
  });
  console.log(`Admin user created: ${email}`);
};

const startServer = async () => {
  const dbConnected = await connectDB();

  if (dbConnected) {
    try {
      await ensureAdminUser();
      const productCount = await Product.estimatedDocumentCount();
      const autoSeedEnabled = String(process.env.AUTO_SEED_CATALOG || 'true').toLowerCase() !== 'false';
      if (autoSeedEnabled && productCount === 0) {
        console.log('Catalog is empty. Running initial catalog seed...');
        await syncCatalog({ shouldConnect: false, shouldReset: false });
      }
    } catch (error) {
      console.error(`Startup sync failed: ${error.message}`);
    }
  }

  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing process or change PORT in server/.env.`);
      process.exit(1);
    }
    console.error(`Server startup error: ${err.message}`);
    process.exit(1);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
