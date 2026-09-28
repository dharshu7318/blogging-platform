const Comment = require("../models/Comment");
const Blog = require("../models/Blog");

const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const blogId = req.params.blogId;

        if (!content) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        const comment = await Comment.create({
            content,
            user: req.user.id,
            blog: blogId
        });

        const populatedComment = await comment.populate(
            "user",
            "name email"
        );

        res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
const getComments = async (req, res) => {
    try {
        const blogId = req.params.blogId;

        const comments = await Comment.find({ blog: blogId })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            comments
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    addComment,
    getComments
};