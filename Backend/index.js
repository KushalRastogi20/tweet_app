import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import router from "./routes/auth.js";
import Tweet from "./models/Tweet.js";
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
app.post("/tweet", async (req, res) => {
  const { user, content } = req.body;
  try {
    const newTweet = new Tweet(user, content);
    await newTweet.save();
    return res.status(200).json(newTweet);
  } catch (error) {
    return res.status(500).json({ message: "Error posting" });
  }
});

app.get("/tweets", async (req, res) => {
  try {
    const tweets = await Tweet.find().sort({ createdAt: -1 });
    return res.status(200).json(tweets);
  } catch (error) {
    return res.status(500).json({ message: "error fetching", error });
  }
});
app.get("/", (req, res) => {
  res.send("Srever is running");
});

app.listen(PORT, (req, res) => {
  console.log("Listening");
});
