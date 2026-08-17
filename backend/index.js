import express from "express";
import { userRoute } from "./route/user.js";
import { courseRoute } from "./route/course.js";
import { adminRoute } from "./route/admin.js";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/admin", adminRoute);

// connectDB is asynchronous in nature.
// First Database need to be connected then server start.
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server start at PORT:${process.env.PORT}`);
  });
});

/*
Another way:-
const startServer = async()=>{
  await connectDB();
  app.listen(process.env.PORT, () => {
    console.log(`Server start at PORT:${process.env.PORT}`);
  });
}

startServer();
*/
