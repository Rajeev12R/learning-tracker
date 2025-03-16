import express from 'express';
import axios from 'axios';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

router.get("/repos", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(!user.githubToken){
            return res.status(401).json({ error: "Unauthorized" });
        }
        const response = await axios.get("https://api.github.com/user/repos", {
            headers: {
                Authorization: `Bearer ${user.githubToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch repositories" });
    }
});

export default router;


