import { useState } from "react";
import "./CreateBlog.css";
function CreateBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  const handleCreateBlog = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/blogs/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            content,
            category,
            image
          })
        }
      );

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        alert("Blog created successfully!");

        setTitle("");
        setContent("");
        setCategory("");
        setImage("");
      } else {
        alert(data.message || "Failed to create blog");
      }
    } catch (error) {
      console.log("Create blog error:", error);
      alert("Server error");
    }
  };

  return (
  <div className="create-container">
    <div className="create-box">
      <h1>Create New Blog</h1>

      <form onSubmit={handleCreateBlog}>

        <label>Blog Title</label>
        <input
          type="text"
          placeholder="Enter blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Content</label>
        <textarea
          placeholder="Write your blog content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="8"
        />

        <label>Category</label>
        <input
          type="text"
          placeholder="Example: Technology"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <label>Image URL</label>
        <input
          type="text"
          placeholder="Optional"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <button type="submit">
          📝 Publish Blog
        </button>

      </form>
    </div>
  </div>
);
}

export default CreateBlog;