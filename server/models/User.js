import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photo: { type: String },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
