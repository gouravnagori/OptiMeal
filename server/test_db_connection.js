import 'dotenv/config';
import mongoose from 'mongoose';

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    console.log("Testing connection to:", uri ? "URI Provided" : "No URI");
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB Connected Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

connectDB();
