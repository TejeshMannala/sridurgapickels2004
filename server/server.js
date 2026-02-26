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
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Create app FIRST
const app = express();


// ================= CORS CONFIG =================
const allowedOrigins = [
  'https://sridurgapickels.onrender.com',
  'https://kanakadurgapickels.onrender.com',
  'https://sridurgapickels-admin.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / curl
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked for this origin'));
    }
  },
  credentials: true
}));

app.options('*', cors()); // enable preflight
// =================================================


// Body parser
app.use(express.json());

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 2000,
});
app.use(limiter);


// ================= ROUTES =================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Kanaka Durga Pickles API is running'
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


// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const productCount = await Product.estimatedDocumentCount();
    if (productCount === 0) {
      await syncCatalog({ shouldConnect: false, shouldReset: false });
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();