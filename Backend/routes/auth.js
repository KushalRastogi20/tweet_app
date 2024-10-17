import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import dotenv from "dotenv";
import User from "../models/User.js";
import Tweet from "../models/Tweet.js"; // Import Tweet model

dotenv.config();

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Middleware to authenticate the user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Registration route
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token, message: "New user created" });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token, message: "Logged in successfully" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// Profile completion route
router.post(
  "/complete-profile",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    const { username } = req.body;
    const image = req.file ? req.file.path : null;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Update user profile
      user.username = username;
      user.image = image;
      await user.save();

      return res
        .status(200)
        .json({ message: "Profile completed successfully" });
    } catch (error) {
      console.error("Profile completion error:", error.message);
      return res
        .status(500)
        .json({ message: "Server error during profile completion" });
    }
  }
);

// Edit Profile Route
router.put( "/edit-profile",authenticate,upload.single("image"),async (req, res) => {
    const { username } = req.body;
    const image = req.file ? req.file.path : null;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update the username and image if provided
      if (username) user.username = username;
      if (image) user.image = image;

      await user.save();

      return res.status(200).json({
        message: "Profile updated successfully",
        user: {
          username: user.username,
          image: user.image,
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error.message);
      return res
        .status(500)
        .json({ message: "Server error during profile update" });
    }
  }
);

// Get user profile
router.get("/userProfile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// Post tweet
router.post("/tweet", authenticate, async (req, res) => {
  const { content } = req.body;

  try {
    const tweet = new Tweet({
      user: req.user.id,
      content,
      createdAt: new Date(),
    });

    await tweet.save();
    res.status(201).json({ message: "Tweet created", tweet });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error posting tweet" });
  }
});

// Get all tweets
router.get("/tweets", async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .sort({ createdAt: -1 })
      .populate("user", "username"); // Populate user and fetch the username
    res.status(200).json(tweets);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error fetching tweets" });
  }
});

// Serve uploaded files
router.use("/uploads", express.static("uploads"));

export default router;
