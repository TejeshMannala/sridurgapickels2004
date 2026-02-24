const mongoose = require('mongoose');

const connectDB = async () => {
  // Fail queries fast when DB is not connected instead of buffering indefinitely.
  mongoose.set('bufferCommands', false);

  const uris = [
    process.env.MONGO_URI,
    process.env.MONGO_URI_FALLBACK,
    process.env.MONGO_URI_LOCAL,
  ].filter(Boolean);

  if (uris.length === 0) {
    console.error('MongoDB connection failed: no Mongo URI configured.');
    console.error('Set MONGO_URI (and optional MONGO_URI_FALLBACK/MONGO_URI_LOCAL) in server/.env');
    return false;
  }

  let lastError;

  for (const uri of uris) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection attempt failed for configured URI: ${error.message}`);
    }
  }

  console.error(`MongoDB connection failed: ${lastError ? lastError.message : 'unknown error'}`);
  console.error('API server will continue running, but database-backed routes will fail until MongoDB is available.');
  return false;
};

module.exports = connectDB;
