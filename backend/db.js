import mongoose from "mongoose";

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
