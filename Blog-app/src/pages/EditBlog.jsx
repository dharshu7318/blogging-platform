import { useEffect, useState } from "react";
import "./EditBlog.css";
function EditBlog() {
  const blogId = window.location.pathname.split("/")[2];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/blogs/${blogId}`)
      .then((response) => response.json())
      .then((data) => {
        const blog = data.blog;

        setTitle(blog.title);
        setContent(blog.content);
        setCategory(blog.category);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }, [blogId]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/blogs/${blogId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            content,
            category
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Blog updated successfully!");

        window.location.href = `/blog/${blogId}`;
      } else {
        alert(data.message || "Failed to update blog");
      }
    } catch (error) {
      console.log("Update error:", error);
    }
  };

  return (
  <div className="edit-container">
    <div className="edit-box">
      <h1>Edit Blog</h1>

      <form onSubmit={handleUpdate}>
        <label>Blog Title</label>

        <input
          type="text"
          placeholder="Blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Content</label>

        <textarea
          placeholder="Blog content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="8"
        />

        <label>Category</label>

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button type="submit">
          ✏️ Update Blog
        </button>
      </form>
    </div>
  </div>
);
}

export default EditBlog;