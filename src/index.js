import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
// require("dotenv").config({ path: "./env" });

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App is listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDb connection failed", err);
  });
