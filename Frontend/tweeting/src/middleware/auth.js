import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // jose is better than jsonwebtoken in edge runtimes

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyJWt(req) {
  const token = req.cookies.get("token")?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify JWT
    await jwtVerify(token, secret);
    // ✅ Token is valid, allow request
    return NextResponse.next();
  } catch (err) {
    console.error("Invalid token:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// // Apply middleware only to protected routes
// export const config = {
//   matcher: ["/dashboard/:path*", "/profile/:path*"], // adjust as needed
// };
