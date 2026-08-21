const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/oceanographic";

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);

  console.log("MongoDB connected");
}

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  isMongoReady,
};
