import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // We get the string from .env. 
    // The "as string" tells TypeScript: "Trust me, this variable exists."
    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
  } catch (error) {
    // TypeScript check: make sure 'error' is an actual Error object
    if (error instanceof Error) {
      console.error(`Error: ${error.message} ❌`);
    }
    process.exit(1); // Stop the server if the database fails
  }
};

export default connectDB;