import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true,
        
    },
    fullName: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: [true, "Password is required"],
    },
    profilePic: {
        type: String,
        default: "",
    },avatar:{
        type:String, // cloudinary url
        
    },
    coverImage:
    {
        type:String, 
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export { User };