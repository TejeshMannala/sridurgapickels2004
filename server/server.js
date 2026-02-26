const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const { syncCatalog } = require('./scripts/seedCatalog');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Create app FIRST
const app = express();

const allowedOrigins = new Set([
  'https://sridurgapickels.onrender.com',
  'https://kanakadurgapickels.onrender.com',
  'https://sridurgapickels-admin.onrender.com',
  'https://kanakadurgapickels-admin.onrender.com',
  'https://kankadurgapickels-admin.onrender.com',
  String(process.env.CLIENT_URL || '').trim(),
  String(process.env.ADMIN_URL || '').trim(),
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean));

const corsOptions = {
  origin: (origin, callback) => {
    const isLocalDevOrigin =
      typeof origin === 'string' &&
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

    if (!origin || isLocalDevOrigin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


// Body parser
app.use(express.json());

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);


app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Kanaka Durga Pickles API is running',
    health: '/health',
    apiHealth: '/api/v1/health',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'kanaka-durga-pickles-server',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const statusCode = dbConnected ? 200 : 503;

  res.status(statusCode).json({
    success: dbConnected,
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    service: 'kanaka-durga-pickles-server',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/categories', require('./routes/categoryRoutes'));
app.use('/api/v1/cart', require('./routes/cartRoutes'));
app.use('/api/v1/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/support', require('./routes/supportRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));


// Error middleware
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
let server;

const ensureAdminUser = async () => {
  const email = String(process.env.ADMIN_EMAIL || 'admin@pickles.com').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || 'Admin@123');

  if (!email || !password) return;

  const existing = await User.findOne({ email }).select('+password');
  if (existing) {
    let changed = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      changed = true;
    }

    // Keep admin credentials in sync with env for reliable dashboard login.
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
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error('MongoDB connection failed. Server not started.');
      process.exit(1);
    }

    await ensureAdminUser();

    const productCount = await Product.estimatedDocumentCount();
    if (productCount === 0) {
      await syncCatalog({ shouldConnect: false, shouldReset: false });
    }

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
