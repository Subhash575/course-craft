import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

// db connection setup:-
// Here we also exporting our connection
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected: " + conn.connection.host);
    // console.log("Host:", mongoose.connection.host);
    // console.log("Database:", mongoose.connection.name);
    // console.log("State:", mongoose.connection.readyState);
  } catch (err) {
    console.log(err);
    process.exit(1); //terminate nodejs process.
  }
};

// conn.connection → The actual database connection object
// conn.connection.host The host property tells you which MongoDB server (host/IP address) you are connected to.

const { Schema } = mongoose; // or const Schema = mongoose.Schema;
const { ObjectId } = Schema; // similarly here

// User Schema
const userSchema = new Schema({
  _id: ObjectId,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  firstName: String,
  lastName: String,
});

// Admin Schema
const adminSchema = new Schema({
  _id: ObjectId,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  firstName: String,
  lastName: String,
});

// Course Schema
const courseSchema = new Schema({
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  ImageUrl: String,
  // course created by the admin(creator)
  creatorId: {
    type: ObjectId,
    ref: "admin",
  },
});

// Purchase Schema

const purchaseSchema = new Schema({
  _id: ObjectId,
  // which course is purchase.
  courseId: {
    type: ObjectId,
    ref: "course",
  },

  // which user purchase the course
  userId: {
    type: ObjectId,
    ref: "users",
  },
});

// inside -> mongoose.model(); we pass collection name (1 argument), (2 argument) schema name.
export const UserModel = mongoose.model("users", userSchema);
export const AdminModel = mongoose.model("admin", adminSchema);
export const CourseModel = mongoose.model("course", courseSchema);
export const PurchaseModel = mongoose.model("Purchase", purchaseSchema);
