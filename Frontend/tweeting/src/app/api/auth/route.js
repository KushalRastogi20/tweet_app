import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ isAuth: false });
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.json({ isAuth: true });
  } catch (err) {
    return NextResponse.json({ isAuth: false });
  }
}
