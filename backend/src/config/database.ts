import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lingoalb';

    await mongoose.connect(mongoUri, {
      // Connection pool — allows multiple simultaneous DB queries (big speed boost)
      maxPoolSize: 10,
      minPoolSize: 2,
      // Timeouts — fail fast instead of hanging
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });

    // Cache frequently used queries in memory
    mongoose.set('debug', false);

    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
