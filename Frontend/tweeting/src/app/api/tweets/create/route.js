// Import Next.js server response helper
import { NextResponse } from "next/server";

// Import your MongoDB connection utility
import { connectionDB } from "@/lib/db";

// Import your Tweet model (Mongoose schema for tweets)
import Tweet from "@/models/Tweet";

// Import JWT verification function from jose
import { jwtVerify } from "jose";

// Encode your JWT secret key into a Uint8Array (needed for jose)
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {  // Define a POST API route
  try {
    await connectionDB();  // Ensure database connection is established

    // Get the JWT token stored in cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      // If no token, return unauthorized response
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify the token and extract its payload (user info inside token)
    const { payload } = await jwtVerify(token, secret);

    // ✅ Since frontend is sending FormData, parse it properly
    const form = await req.formData();

    // Extract text content from form data
    const content = form.get("content");

    // Extract all uploaded images (getAll because multiple files can have same key)
    const images = form.getAll("images");

    // Extract the uploaded audio file (only one expected)
    const audio = form.get("audio");

    // Debug log to confirm what content is being received
    console.log("Request content:", content);

    // Validate that tweet text isn't empty
    if (!content || content.trim() === "") {
      return NextResponse.json({ message: "Content required" }, { status: 400 });
    }

    // Build a media object to store references to uploaded files
    // Right now we just keep filenames — later you’ll replace this with URLs after uploading to Cloudinary or S3
    // const media = {
    //   images: images.map(img => (typeof img === "string" ? img : img.name)), // map over each File
    //   audio: audio ? (typeof audio === "string" ? audio : audio.name) : null, // check if audio exists
    // };

    // Create a new Tweet in MongoDB with content, media, and user ID from payload
    const tweet = await Tweet.create({
      content,
      // media,
      author: payload.userId,  // pulled from verified JWT payload
    });

    // Return success response with the newly created tweet
    return NextResponse.json({ message: "Tweet created", tweet }, { status: 201 });
  } catch (error) {
    // Log error for debugging
    console.error("Tweet creation error:", error);

    // Return generic server error response
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
