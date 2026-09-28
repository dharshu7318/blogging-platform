const express = require("express");

const {
    addComment,
    getComments
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:blogId", protect, addComment);

router.get("/:blogId", getComments);

module.exports = router;