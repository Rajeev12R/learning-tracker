import express from "express";
import passport from "passport";
import { getAuthenticatedUser, logoutUser } from "../controllers/authController.js";

const router = express.Router();

// Google Auth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => res.redirect(`${process.env.FRONTEND_URL}/dashboard`)
);

// GitHub Auth
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => res.redirect(`${process.env.FRONTEND_URL}/dashboard`)
);

// User Routes
router.get("/user", getAuthenticatedUser);
router.get("/logout", (req, res) => {
    res.clearCookie("connect.sid", { path: "/", domain: "localhost", httpOnly: true });
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  

export default router;
