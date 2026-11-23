import mongoose from 'mongoose';

// Single connection helper called once from server.js at boot. Exits
// the process on failure rather than letting the app run against a
// dead database — fast, loud failure beats silent request errors.
export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
}
