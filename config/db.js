const mongoose = require('mongoose');

const connectDB = async () => {
   try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`\nMongoDB connected !! DB HOST: ${process.env.MONGO_URI}`);
   } catch (error) {
    console.error('MongoDB connection FAILED', error);
    process.exit(1);
   }
}



module.exports = connectDB;