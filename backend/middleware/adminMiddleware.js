const User = require("../models/User");

const adminOnly = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Not authorized. Please login."
            });
        }

        const user = await User.findById(req.user.id);

        if (!user || user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin privileges required."
            });
        }

        req.adminUser = user;
        next();
    } catch (error) {
        res.status(500).json({
            message: "Server error checking admin privileges",
            error: error.message
        });
    }
};

module.exports = adminOnly;
