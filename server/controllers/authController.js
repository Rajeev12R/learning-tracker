export const getAuthenticatedUser = (req, res) => {
    if (req.isAuthenticated()) {
        return res.json(req.user);
    } else {
        return res.status(401).json({ message: "Not authenticated" });
    }
};

export const logoutUser = (req, res) => {
    req.logout(() => {
        res.redirect(process.env.FRONTEND_URL);
    });
};
