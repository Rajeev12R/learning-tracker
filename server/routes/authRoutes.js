import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const router = express.Router();

// Google Auth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => res.redirect(`${process.env.FRONTEND_URL}/dashboard`)
);

// GitHub Auth
router.get("/github", passport.authenticate("github", { scope: ["user:email", "repo"] }));
router.get("/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      const user = req.user;
      console.log("Callback user:", user);

      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
      }

      // Generate JWT token with user data
      const token = jwt.sign(
        {
          id: user._id,
          githubId: user.githubId,
          name: user.name,
          githubToken: user.githubToken // Include GitHub token in JWT
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set cookies
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (error) {
      console.error("Auth callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL}?error=server_error`);
    }
  }
);

// Get authenticated user
router.get("/user", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if GitHub token exists
    if (!user.githubToken) {
      return res.status(401).json({ message: "GitHub token not found" });
    }

    // Return user data including GitHub token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      githubId: user.githubId,
      githubToken: user.githubToken,
      provider: user.provider
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  // Clear all cookies
  res.clearCookie("token");
  res.clearCookie("connect.sid");

  // Destroy session
  req.session.destroy(() => {
    res.status(200).json({ message: "Logged out successfully" });
  });
});

export default router;
