const express = require("express");

const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  getMyBlogs
} = require("../controllers/blogController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create blog
router.post("/create", protect, createBlog);

// Get all blogs
router.get("/", getAllBlogs);

// Get logged-in user's blogs
router.get("/myblogs", protect, getMyBlogs);

// Get single blog
router.get("/:id", getBlogById);

// Update blog
router.put("/:id", protect, updateBlog);

// Delete blog
router.delete("/:id", protect, deleteBlog);

// Like / Unlike blog
router.put("/:id/like", protect, likeBlog);

module.exports = router;