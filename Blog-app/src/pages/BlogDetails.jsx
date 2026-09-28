import { useEffect, useState } from "react";
import "./BlogDetails.css";

function BlogDetails() {
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const blogId = window.location.pathname.split("/")[2];

  // Fetch blog and comments when page loads
  useEffect(() => {
    fetchBlog();
    fetchComments();
  }, [blogId]);

  // Get blog details
  const fetchBlog = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/blogs/${blogId}`
      );

      const data = await response.json();

      setBlog(data.blog);
    } catch (error) {
      console.log("Blog error:", error);
    }
  };

  // Get comments
  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${blogId}`
      );

      const data = await response.json();

      setComments(data.comments);
    } catch (error) {
      console.log("Comments error:", error);
    }
  };

  // Like / Unlike blog
  const handleLike = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to like this blog");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/blogs/${blogId}/like`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      alert(data.message);

      fetchBlog();
    } catch (error) {
      console.log("Like error:", error);
    }
  };

  // Add comment
  const handleComment = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to comment");
      return;
    }

    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${blogId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            content: commentText
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Comment added successfully!");

        setCommentText("");

        fetchComments();
      } else {
        alert(data.message || "Failed to add comment");
      }
    } catch (error) {
      console.log("Comment error:", error);
    }
  };

  // Delete blog
  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/blogs/${blogId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Blog deleted successfully!");

        window.location.href = "/";
      } else {
        alert(data.message || "Failed to delete blog");
      }
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  // Loading message
  if (!blog) {
    return <p>Loading blog...</p>;
  }

  return (
    
    <div className="blog-details-container">

      <div className="blog-details-card">
<button
  className="back-button"
  onClick={() => {
    window.location.href = "/blogs";
  }}
>
  ← Back to Blogs
</button>
        {/* Blog title */}
        <h1>{blog.title}</h1>

        {/* Blog content */}
        <p className="blog-content">
          {blog.content}
        </p>

        {/* Blog information */}
        <p className="blog-info">
          <strong>Category:</strong> {blog.category}
        </p>

        <p className="blog-info">
          <strong>Author:</strong> {blog.author?.name}
        </p>

        {/* Blog buttons */}
        <div className="blog-buttons">

          <button onClick={handleLike}>
            ❤️ {blog.likes?.length || 0} Likes
          </button>

          <button
            onClick={() => {
              window.location.href = `/edit/${blogId}`;
            }}
          >
            ✏️ Edit Blog
          </button>

          <button onClick={handleDelete}>
            🗑️ Delete Blog
          </button>

        </div>

        <hr />

        {/* Comments */}
        <div className="comments-section">

          <h2>💬 Comments</h2>

          <form onSubmit={handleComment}>

            <textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows="4"
            />

            <button
              className="comment-submit"
              type="submit"
            >
              Add Comment
            </button>

          </form>

          {/* Display comments */}
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div className="comment" key={comment._id}>

                <strong>
                  {comment.user?.name}
                </strong>

                <p>
                  {comment.content}
                </p>

              </div>
            ))
          )}

        </div>

        <br />

        {/* Back button */}
        <button
          className="back-button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          ← Back to Home
        </button>

      </div>

    </div>
  );
}

export default BlogDetails;