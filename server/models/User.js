import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: "",
    },
    // OAuth providers
    googleId: String,
    githubId: String,
    githubToken: String,
    provider: {
        type: String,
        enum: ['google', 'github'],
        required: true,
        default: 'github'
    },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
