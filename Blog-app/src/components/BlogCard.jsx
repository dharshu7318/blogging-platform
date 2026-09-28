import "./BlogCard.css";

function BlogCard({ blog }) {
  const openBlog = () => {
    window.location.href = `/blog/${blog._id}`;
  };

  return (
    <div className="blog-card">
      <h2>{blog.title}</h2>

      <p>{blog.content}</p>

      <p className="blog-category">
        Category: {blog.category}
      </p>

      <p className="blog-author">
        Author: {blog.author?.name}
      </p>

      <div className="blog-actions">
        <button className="like-button">
          ❤️ {blog.likes?.length || 0} Likes
        </button>

        <button className="comment-button">
          💬 Comments
        </button>

        <button onClick={openBlog}>
          Read More
        </button>
      </div>
    </div>
  );
}

export default BlogCard;