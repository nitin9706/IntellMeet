import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const connectdb = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL ||
      "mongodb://127.0.0.1:27017/IntellMeet";

    const connectionInstance = await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || DB_NAME,
    });

    console.log(
      "DB is connected sucessfuly",
      connectionInstance.connection.host,
    );
  } catch (error) {
    console.log(`DataBase connection failed ${error}`);
    throw error;
  }
};
export default connectdb;
