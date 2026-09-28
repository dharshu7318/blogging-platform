import { useEffect, useState } from "react";
import "./Blogs.css";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/blogs"
    );

    const data = await response.json();

    const blogList = Array.isArray(data.blogs)
      ? data.blogs
      : data;

    const blogsWithComments = await Promise.all(
      blogList.map(async (blog) => {
        try {
          const commentResponse = await fetch(
            `http://localhost:5000/api/comments/${blog._id}`
          );

          const commentData = await commentResponse.json();

          return {
            ...blog,
            commentCount: Array.isArray(commentData.comments)
              ? commentData.comments.length
              : Array.isArray(commentData)
              ? commentData.length
              : 0
          };
        } catch (error) {
          return {
            ...blog,
            commentCount: 0
          };
        }
      })
    );

    setBlogs(blogsWithComments);

  } catch (error) {
    console.log("Error fetching blogs:", error);
  }
};

  // Get unique categories
  const categories = [
  "All",
  "Technology",
  "Travel",
  "Food",
  "Lifestyle"
];

  // Search + category filter
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      blog.content
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      blog.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="blogs-page">

      {/* Header */}
      <div className="blogs-header">
        <p className="small-heading">WELCOME TO BLOGIFY</p>

        <h1>Discover Amazing Stories</h1>

        <p className="blogs-subtitle">
          Read, write and share your ideas with the world.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="blog-controls">

        <div className="search-box">
          🔍
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

      </div>

      {/* Blog count */}
      <p className="blog-count">
        {filteredBlogs.length} blog
        {filteredBlogs.length !== 1 ? "s" : ""} found
      </p>

      {/* Blogs */}
      {filteredBlogs.length === 0 ? (

        <div className="no-blogs">
          <div className="no-blog-icon">📝</div>

          <h2>No blogs found</h2>

          <p>
            Try searching with a different keyword.
          </p>
        </div>

      ) : (

        <div className="blogs-container">

          {filteredBlogs.map((blog) => (

            <div className="blog-card" key={blog._id}>

              {/* Image */}
              {blog.image ? (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="blog-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="blog-image-placeholder">
                  📝
                </div>
              )}

              <div className="blog-card-content">

                {/* Category */}
                <span className="category-badge">
                  {blog.category}
                </span>

                {/* Title */}
                <h2>{blog.title}</h2>

                {/* Description */}
                <p className="blog-description">
                  {blog.content?.length > 150
                    ? blog.content.substring(0, 150) + "..."
                    : blog.content}
                </p>

                {/* Author */}
                <div className="blog-author">
                  <div className="author-icon">
                    👤
                  </div>

                  <div>
                    <small>Written by</small>
                    <p>
                      {blog.author?.name || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Bottom */}
                <div className="blog-card-bottom">

                  <div className="blog-stats">
                    <span>
                      ❤️ {blog.likes?.length || 0}
                    </span>

                    <span>
  💬 {blog.commentCount || 0}
</span>
                  </div>

                  <button
                    onClick={() => {
                      window.location.href =
                        `/blog/${blog._id}`;
                    }}
                  >
                    Read More →
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

export default Blogs;