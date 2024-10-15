import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import router from "./routes/auth.js";
dotenv.config();
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/auth", router);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Srever is running");
});

app.listen(PORT, (req, res) => {
  console.log("Listening");
});
