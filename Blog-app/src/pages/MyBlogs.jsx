import { useEffect, useState } from "react";
import "./MyBlogs.css";

function MyBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/blogs/myblogs",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log("My Blogs:", data);

      if (response.ok) {
        setBlogs(data.blogs || []);
      } else {
        alert(data.message || "Unable to load your blogs");
      }

    } catch (error) {
      console.log("Error fetching my blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/blogs/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Blog deleted successfully");

        setBlogs(
          blogs.filter((blog) => blog._id !== id)
        );
      } else {
        alert(data.message || "Delete failed");
      }

    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  if (loading) {
    return (
      <div className="myblogs-page">
        <div className="loading">
          Loading your blogs...
        </div>
      </div>
    );
  }

  return (
    <div className="myblogs-page">

      <div className="myblogs-header">

        <p className="small-heading">
          YOUR CONTENT
        </p>

        <h1>My Blogs</h1>

        <p>
          Manage all the blogs you have created.
        </p>

      </div>

      {blogs.length === 0 ? (

        <div className="empty-blogs">

          <div className="empty-icon">
            📝
          </div>

          <h2>No blogs yet</h2>

          <p>
            You haven't uploaded any blogs yet.
          </p>

          <button
            onClick={() => {
              window.location.href = "/create";
            }}
          >
            + Create Blog
          </button>

        </div>

      ) : (

        <div className="myblogs-container">

          {blogs.map((blog) => (

            <div
              className="myblog-card"
              key={blog._id}
            >

              {blog.image ? (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="myblog-image"
                />
              ) : (
                <div className="myblog-placeholder">
                  📝
                </div>
              )}

              <div className="myblog-content">

                <span className="category-badge">
                  {blog.category}
                </span>

                <h2>{blog.title}</h2>

                <p className="myblog-description">
                  {blog.content?.length > 130
                    ? blog.content.substring(0, 130) + "..."
                    : blog.content}
                </p>

                <div className="myblog-stats">
                  ❤️ {blog.likes?.length || 0} Likes
                </div>

                <div className="myblog-buttons">

                  <button
                    className="read-button"
                    onClick={() => {
                      window.location.href =
                        `/blog/${blog._id}`;
                    }}
                  >
                    📖 Read
                  </button>

                  <button
                    className="edit-button"
                    onClick={() => {
                      window.location.href =
                        `/edit/${blog._id}`;
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDelete(blog._id)
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default MyBlogs;