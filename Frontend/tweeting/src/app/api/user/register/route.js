import { connectionDB } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User.js"
import jwt from "jsonwebtoken";

export async function POST(req) {
    const body = await req.json();
    console.log("Request body:", body);
    //destructure the body
    const { firstName, lastName, email, phoneNumber, dateOfBirth, password,username, profilePicture, gender, country, city, occupation, bio } = body;
    console.log("Destructured data:", firstName, lastName, email)
    try {
        const connection = await connectionDB();
        // if (connection.status !== 200) {
        //     return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
        // }
        //check if user exists
        console.log("connected to db");
        // const userExits = await User.findOne({ $or: [{ email, phoneNumber }] });
        // console.log("User exists:", userExits);
        // if (userExits) {
        //     return NextResponse.json({ message: "User already exists" }, { status: 400 });
        // }
        console.log("1")
        //new user
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log("2", hashedPassword);
        // const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 12);
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            username,
            phoneNumber,
            dateOfBirth,
            password: hashedPassword,
            // confirmPassword,
            // profilePicture,
            gender,
            country,
            city,
            bio,
            occupation,
        });
        console.log("3", newUser)
        if (!newUser) {
            return NextResponse.json({ message: "User registration failed" }, { status: 500 });
            // return NextResponse.json({message:"User registered successfully"}, {status:201}, {data:newUser});
        }

        const token = jwt.sign({
            userId: newUser._id,
            email: newUser.email,
            username: newUser.username
        }, process.env.JWT_SECRET, { expiresIn: "7d" }
        )
        const { password: _, ...userDa } = newUser.toObject();
        const response = NextResponse.json(
            { message: "User registered successfully", token, user: userDa },
            { status: 201 }
        );
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: false, // Set to true in production
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });
        return response;
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
