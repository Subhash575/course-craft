import express from "express";
import { userRoute } from "./route/user.js";
import { courseRoute } from "./route/course.js";

const app = express();

app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);

app.listen(3000, () => {
  console.log("server start at port: 3000");
});
