import bcrypt from "bcryptjs";
import { connectionDB } from "@/lib/db.js";
import User from "@/models/User";
import { NextResponse } from 'next/server';
import jwt from "jsonwebtoken";
export async function POST(req) {
    const body = await req.json();
    const { email, password } = body;
    await connectionDB();
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }
        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET, { expiresIn: "7d" }
        )
        const { password: _, ...userData } = user.toObject();
        // const response = NextResponse.json({ message: "Login successful", token, user: userData }, { status: 200 });
        const response = NextResponse.json(
            { message: "Login successful", token, user: userData },
            { status: 200 }
        );


        response.cookies.set("token", token, {
            httpOnly: true,
            secure: false, // Set to true in production
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/"
        });
        // return NextResponse.json({ message: "Login successful" }, { status: 200 }, { data: user });
        return response; // ✅ return the modified response

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}