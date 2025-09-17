import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,    
        required: true   
    },
    username:{
        type: String,
        required: true,
        unique: true,   
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: "https://res.cloudinary.com/dzcmadjl1/image/upload/v1696110736/default_profile_picture_oqtq9r.png"
    },
    occupation: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        maxlength: 200,
        required: false
    }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
