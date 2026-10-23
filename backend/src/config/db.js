import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('username:password') || uri.includes('cluster.mongodb.net')) {
    console.warn('MongoDB URI is not configured. Running with in-memory public data.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.warn('Continuing with in-memory public data.');
    return null;
  }
};

export default connectDB;
