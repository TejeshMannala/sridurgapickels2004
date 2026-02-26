const mongoose = require('mongoose');

let reconnectTimer = null;
let isConnecting = false;

const getUris = () =>
  [
    process.env.MONGO_URI,
    process.env.MONGO_URI_FALLBACK,
    process.env.MONGO_URI_LOCAL,
  ].filter(Boolean);

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const scheduleReconnect = () => {
  if (reconnectTimer || mongoose.connection.readyState === 1) return;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    console.log("🔄 Attempting MongoDB reconnect...");
    await connectDB();
  }, 15000);
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error; // IMPORTANT
  }
};

  let lastError;

  for (const uri of uris) {
    try {
      // 🔥 Disconnect before retrying new URI
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      clearReconnectTimer();
      isConnecting = false;
      return true;

    } catch (error) {
      lastError = error;
      console.error(`❌ MongoDB connection failed: ${error.message}`);
    }
  }

  console.error('❌ All MongoDB connection attempts failed.');
  isConnecting = false;

  scheduleReconnect();
  return false;


mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected.');
  scheduleReconnect();
});

mongoose.connection.on('error', (error) => {
  console.error(`⚠ MongoDB runtime error: ${error.message}`);
  scheduleReconnect();
});

module.exports = connectDB;