import { connectionDB } from "@/lib/db";
import Tweet from "@/models/Tweet";
import User from "@/models/User";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req) {
  await connectionDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await jwtVerify(token, secret);

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const tweets = await Tweet.find()
    .populate("author")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  console.log(tweets); // fixed

  return NextResponse.json({ tweets }, { status: 200 });
}
