import mongoose from "mongoose";
// import { NextResponse } from "next/server";

let isConnected = false;

export async function connectionDB(){
    if(isConnected){
        console.log("Database is already connected");
        return isConnected;
    }
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        });
        if(connection){
            isConnected= true;
            console.log("Database connected");
            return  connection;
        }
    }catch(error){
        console.log(error);
        return error;
    }
}