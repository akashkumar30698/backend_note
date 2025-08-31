import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI; // ✅ use the env variable directly
  //console.log("uri: ",uri)
  if (!uri) throw new Error('MONGODB_URI missing');

  mongoose.set('strictQuery', true);

  // Optional: extract DB name from URI if needed
  const dbName = uri.split('/').pop();
  
  await mongoose.connect(uri, { dbName });
  console.log('✅ MongoDB connected');
};
