const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const User = require("../models/User");

// ==========================================
// CREATE BLOG
// ==========================================

const createBlog = async (req, res) => {
    try {
        const { title, content, category, image } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({
                message: "Title, content and category are required"
            });
        }

        const blog = await Blog.create({
            title,
            content,
            category,
            image,
            author: req.user.id
        });

        res.status(201).json({
            message: "Blog created successfully",
            blog
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET ALL BLOGS
// ==========================================

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            blogs
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET MY BLOGS
// ==========================================

const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({
            author: req.user.id
        })
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            blogs
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET SINGLE BLOG
// ==========================================

const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate("author", "name email");

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.status(200).json({
            blog
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE BLOG
// ==========================================

const updateBlog = async (req, res) => {
    try {
        const { title, content, category, image } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        // Only the author can update the blog
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only update your own blog"
            });
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        blog.category = category || blog.category;

        // Allow image to be updated
        if (image !== undefined) {
            blog.image = image;
        }

        const updatedBlog = await blog.save();

        res.status(200).json({
            message: "Blog updated successfully",
            blog: updatedBlog
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// DELETE BLOG
// ==========================================

const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        const user = await User.findById(req.user.id);
        const isAdmin = user && user.role === "admin";

        // Author or Admin can delete the blog
        if (blog.author.toString() !== req.user.id && !isAdmin) {
            return res.status(403).json({
                message: "You can only delete your own blog"
            });
        }

        await blog.deleteOne();
        await Comment.deleteMany({ blog: blog._id });

        res.status(200).json({
            message: "Blog deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// LIKE / UNLIKE BLOG
// ==========================================

const likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        const userId = req.user.id;

        // Check if already liked
        const alreadyLiked = blog.likes.some(
            (id) => id.toString() === userId
        );

        if (alreadyLiked) {

            // UNLIKE
            blog.likes = blog.likes.filter(
                (id) => id.toString() !== userId
            );

            await blog.save();

            return res.status(200).json({
                message: "Blog unliked",
                likes: blog.likes.length
            });
        }

        // LIKE
        blog.likes.push(userId);

        await blog.save();

        res.status(200).json({
            message: "Blog liked",
            likes: blog.likes.length
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// EXPORT ALL FUNCTIONS
// ==========================================

module.exports = {
    createBlog,
    getAllBlogs,
    getMyBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    likeBlog
};