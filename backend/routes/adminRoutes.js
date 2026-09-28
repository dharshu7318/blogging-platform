const express = require("express");
const {
    getDashboardStats,
    getAllUsers,
    toggleUserRole,
    deleteUser,
    getAllBlogsAdmin,
    deleteBlogAdmin,
    getAllCommentsAdmin,
    deleteCommentAdmin,
    promoteSelfToAdmin
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Development/testing helper to easily make the logged in user an admin
router.post("/promote-me", protect, promoteSelfToAdmin);

// Protected Admin-only routes
router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id/role", protect, adminOnly, toggleUserRole);
router.delete("/users/:id", protect, adminOnly, deleteUser);

router.get("/blogs", protect, adminOnly, getAllBlogsAdmin);
router.delete("/blogs/:id", protect, adminOnly, deleteBlogAdmin);

router.get("/comments", protect, adminOnly, getAllCommentsAdmin);
router.delete("/comments/:id", protect, adminOnly, deleteCommentAdmin);

module.exports = router;
