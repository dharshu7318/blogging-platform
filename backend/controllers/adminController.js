const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");

// ==========================================
// 1. DASHBOARD OVERVIEW STATS
// ==========================================
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalBlogs, totalComments] = await Promise.all([
            User.countDocuments(),
            Blog.countDocuments(),
            Comment.countDocuments()
        ]);

        const allBlogs = await Blog.find({}, "likes category");
        const totalLikes = allBlogs.reduce(
            (sum, blog) => sum + (blog.likes?.length || 0),
            0
        );

        // Group by category
        const categoryCounts = {};
        allBlogs.forEach((blog) => {
            const cat = blog.category || "Uncategorized";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        // Recent 5 blogs
        const recentBlogs = await Blog.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent 5 users
        const recentUsers = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            totalUsers,
            totalBlogs,
            totalComments,
            totalLikes,
            categoryCounts,
            recentBlogs,
            recentUsers
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard statistics",
            error: error.message
        });
    }
};

// ==========================================
// 2. USER MANAGEMENT
// ==========================================
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        // Get blog count for each user
        const blogCounts = await Blog.aggregate([
            { $group: { _id: "$author", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        blogCounts.forEach((item) => {
            if (item._id) {
                countMap[item._id.toString()] = item.count;
            }
        });

        const usersWithStats = users.map((u) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role || "user",
            createdAt: u.createdAt,
            blogCount: countMap[u._id.toString()] || 0
        }));

        res.status(200).json({ users: usersWithStats });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

const toggleUserRole = async (req, res) => {
    try {
        const targetUserId = req.params.id;

        // Prevent admin from demoting themselves
        if (targetUserId === req.user.id) {
            return res.status(400).json({
                message: "You cannot change your own admin role"
            });
        }

        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = user.role === "admin" ? "user" : "admin";
        await user.save();

        res.status(200).json({
            message: `User role changed to ${user.role}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update user role",
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;

        if (targetUserId === req.user.id) {
            return res.status(400).json({
                message: "You cannot delete your own account from the admin dashboard"
            });
        }

        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete user and associated blogs & comments
        await Promise.all([
            User.findByIdAndDelete(targetUserId),
            Blog.deleteMany({ author: targetUserId }),
            Comment.deleteMany({ user: targetUserId })
        ]);

        res.status(200).json({
            message: "User and associated content deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};

// ==========================================
// 3. BLOG MANAGEMENT (ADMIN)
// ==========================================
const getAllBlogsAdmin = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        // Get comment counts
        const commentCounts = await Comment.aggregate([
            { $group: { _id: "$blog", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        commentCounts.forEach((item) => {
            if (item._id) {
                countMap[item._id.toString()] = item.count;
            }
        });

        const blogsWithMeta = blogs.map((b) => ({
            _id: b._id,
            title: b.title,
            category: b.category,
            image: b.image,
            author: b.author,
            likesCount: b.likes?.length || 0,
            commentCount: countMap[b._id.toString()] || 0,
            createdAt: b.createdAt
        }));

        res.status(200).json({ blogs: blogsWithMeta });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch blogs",
            error: error.message
        });
    }
};

const deleteBlogAdmin = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        await Promise.all([
            Blog.findByIdAndDelete(req.params.id),
            Comment.deleteMany({ blog: req.params.id })
        ]);

        res.status(200).json({ message: "Blog and associated comments deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete blog",
            error: error.message
        });
    }
};

// ==========================================
// 4. COMMENT MANAGEMENT (ADMIN)
// ==========================================
const getAllCommentsAdmin = async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate("user", "name email")
            .populate("blog", "title")
            .sort({ createdAt: -1 });

        res.status(200).json({ comments });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch comments",
            error: error.message
        });
    }
};

const deleteCommentAdmin = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete comment",
            error: error.message
        });
    }
};

// ==========================================
// 5. SELF-PROMOTION / TESTING HELPER
// ==========================================
const promoteSelfToAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = "admin";
        await user.save();

        res.status(200).json({
            message: "Account upgraded to Admin successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to promote account",
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    toggleUserRole,
    deleteUser,
    getAllBlogsAdmin,
    deleteBlogAdmin,
    getAllCommentsAdmin,
    deleteCommentAdmin,
    promoteSelfToAdmin
};
