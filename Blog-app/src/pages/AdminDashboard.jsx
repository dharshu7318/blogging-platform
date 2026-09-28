import { useState, useEffect } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("adminTheme") || "dark";
  });
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Filters
  const [blogSearch, setBlogSearch] = useState("");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("All");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [commentSearch, setCommentSearch] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("adminTheme", newTheme);
  };

  const showNotification = (message, type = "success") => {
    setAlertMsg({ message, type });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [statsRes, blogsRes, usersRes, commentsRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/stats", { headers }),
        fetch("http://localhost:5000/api/admin/blogs", { headers }),
        fetch("http://localhost:5000/api/admin/users", { headers }),
        fetch("http://localhost:5000/api/admin/comments", { headers })
      ]);

      if (statsRes.status === 403 || usersRes.status === 403) {
        setLoading(false);
        return;
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(blogsData.blogs || []);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments || []);
      }
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      showNotification("Failed to connect to backend", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick self-promote helper
  const handlePromoteSelf = async () => {
    setIsPromoting(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/promote-me", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...currentUser, role: "admin" };
        localStorage.setItem("user", JSON.stringify(updated));
        setCurrentUser(updated);
        showNotification("Account upgraded to Administrator! Loading admin data...", "success");
        fetchDashboardData();
      } else {
        showNotification(data.message || "Failed to promote account", "error");
      }
    } catch (err) {
      showNotification("Server error connecting to backend", "error");
    } finally {
      setIsPromoting(false);
    }
  };

  // Blog Deletion
  const handleDeleteBlog = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the blog "${title}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/blogs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b._id !== id));
        if (stats) {
          setStats((prev) => ({
            ...prev,
            totalBlogs: Math.max(0, prev.totalBlogs - 1)
          }));
        }
        showNotification("Blog deleted successfully", "success");
      } else {
        showNotification(data.message || "Failed to delete blog", "error");
      }
    } catch (err) {
      showNotification("Server error deleting blog", "error");
    }
  };

  // User Role Toggle
  const handleToggleUserRole = async (userId, userName, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Change ${userName}'s role from ${currentRole} to ${newRole}?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        showNotification(`User role updated to ${newRole}`, "success");
      } else {
        showNotification(data.message || "Failed to update role", "error");
      }
    } catch (err) {
      showNotification("Server error updating role", "error");
    }
  };

  // User Deletion
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}" and all their blogs and comments? This cannot be undone.`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setBlogs((prev) => prev.filter((b) => b.author?._id !== userId));
        if (stats) {
          setStats((prev) => ({
            ...prev,
            totalUsers: Math.max(0, prev.totalUsers - 1)
          }));
        }
        showNotification("User and their data deleted successfully", "success");
      } else {
        showNotification(data.message || "Failed to delete user", "error");
      }
    } catch (err) {
      showNotification("Server error deleting user", "error");
    }
  };

  // Comment Deletion
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        if (stats) {
          setStats((prev) => ({
            ...prev,
            totalComments: Math.max(0, prev.totalComments - 1)
          }));
        }
        showNotification("Comment deleted successfully", "success");
      } else {
        showNotification(data.message || "Failed to delete comment", "error");
      }
    } catch (err) {
      showNotification("Server error deleting comment", "error");
    }
  };

  // Filtered lists
  const filteredBlogs = blogs.filter((b) => {
    const matchSearch =
      (b.title || "").toLowerCase().includes(blogSearch.toLowerCase()) ||
      (b.author?.name || "").toLowerCase().includes(blogSearch.toLowerCase());
    const matchCategory =
      blogCategoryFilter === "All" || b.category === blogCategoryFilter;
    return matchSearch && matchCategory;
  });

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(userSearch.toLowerCase());
    const matchRole =
      userRoleFilter === "All" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredComments = comments.filter((c) => {
    const q = commentSearch.toLowerCase();
    return (
      (c.content || "").toLowerCase().includes(q) ||
      (c.user?.name || "").toLowerCase().includes(q) ||
      (c.blog?.title || "").toLowerCase().includes(q)
    );
  });

  const categories = ["All", "Technology", "Travel", "Food", "Lifestyle"];

  // Access check fallback
  const isUserAdmin = currentUser && currentUser.role === "admin";

  if (!isUserAdmin && !loading && !stats) {
    return (
      <div className={`admin-root ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
        <div className="admin-container">
          <div className="admin-access-card">
            <div className="access-icon">🔒</div>
            <h2>Admin Privileges Required</h2>
            <p>
              You are signed in as <strong>{currentUser?.name || "User"}</strong> ({currentUser?.email || "No email"}), but this account does not have administrator privileges yet.
            </p>
            <div className="access-actions">
              <button
                className="btn-primary"
                onClick={handlePromoteSelf}
                disabled={isPromoting}
              >
                {isPromoting ? "Upgrading..." : "⚡ Activate Admin Privileges (Developer)"}
              </button>
              <button
                className="btn-secondary"
                onClick={() => (window.location.href = "/blogs")}
              >
                Back to Blogs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-root ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <div className="admin-container">
        {/* Toast Alert */}
        {alertMsg && (
          <div className={`admin-toast toast-${alertMsg.type}`}>
            {alertMsg.type === "success" ? "✅" : "⚠️"} {alertMsg.message}
          </div>
        )}

        {/* Top Header */}
        <header className="admin-header">
          <div className="header-info">
            <div className="title-wrapper">
              <span className="badge-admin">Admin Portal</span>
              <h1>Platform Management</h1>
            </div>
            <p className="admin-subtitle">
              Monitor key metrics, moderate blogs, manage user permissions, and oversee discussions.
            </p>
          </div>

          <div className="header-actions">
            {/* Dark Mode Switcher */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            {/* Refresh Button */}
            <button
              className="btn-refresh"
              onClick={fetchDashboardData}
              title="Refresh Data"
            >
              🔄 Refresh
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "blogs" ? "active" : ""}`}
            onClick={() => setActiveTab("blogs")}
          >
            📝 Manage Blogs <span className="tab-pill">{blogs.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 Manage Users <span className="tab-pill">{users.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            💬 Manage Comments <span className="tab-pill">{comments.length}</span>
          </button>
        </nav>

        {/* Tab Content */}
        <main className="tab-content">
          {loading ? (
            <div className="admin-loader">
              <div className="spinner"></div>
              <p>Loading platform data...</p>
            </div>
          ) : (
            <>
              {/* ========================================== */}
              {/* TAB 1: OVERVIEW */}
              {/* ========================================== */}
              {activeTab === "overview" && (
                <div className="overview-section">
                  {/* Metric Cards */}
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon-wrapper icon-blue">📝</div>
                      <div className="stat-details">
                        <span className="stat-label">Total Blogs</span>
                        <h2 className="stat-value">{stats?.totalBlogs ?? blogs.length}</h2>
                        <span className="stat-note">Published articles</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper icon-purple">👥</div>
                      <div className="stat-details">
                        <span className="stat-label">Total Users</span>
                        <h2 className="stat-value">{stats?.totalUsers ?? users.length}</h2>
                        <span className="stat-note">Registered accounts</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper icon-green">💬</div>
                      <div className="stat-details">
                        <span className="stat-label">Total Comments</span>
                        <h2 className="stat-value">{stats?.totalComments ?? comments.length}</h2>
                        <span className="stat-note">Community interactions</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper icon-pink">❤️</div>
                      <div className="stat-details">
                        <span className="stat-label">Total Likes</span>
                        <h2 className="stat-value">{stats?.totalLikes ?? 0}</h2>
                        <span className="stat-note">Across all articles</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  {stats?.categoryCounts && (
                    <div className="content-card category-breakdown">
                      <h3>📂 Categories Distribution</h3>
                      <div className="category-tags">
                        {Object.entries(stats.categoryCounts).map(([cat, count]) => (
                          <div key={cat} className="category-tag-item">
                            <span className="cat-name">{cat}</span>
                            <span className="cat-count">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Two-column Quick Views */}
                  <div className="overview-duo">
                    {/* Recent Blogs */}
                    <div className="content-card duo-card">
                      <div className="card-header">
                        <h3>📝 Recent Blog Posts</h3>
                        <button
                          className="link-btn"
                          onClick={() => setActiveTab("blogs")}
                        >
                          View all →
                        </button>
                      </div>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Author</th>
                              <th>Category</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(stats?.recentBlogs || blogs.slice(0, 5)).map((blog) => (
                              <tr key={blog._id}>
                                <td className="font-semibold cell-truncate">{blog.title}</td>
                                <td>{blog.author?.name || "Unknown"}</td>
                                <td>
                                  <span className="category-badge-sm">{blog.category}</span>
                                </td>
                                <td>
                                  <a
                                    href={`/blog/${blog._id}`}
                                    className="action-btn-sm"
                                  >
                                    View
                                  </a>
                                </td>
                              </tr>
                            ))}
                            {(!stats?.recentBlogs || stats.recentBlogs.length === 0) && (
                              <tr>
                                <td colSpan="4" className="empty-cell">No blogs yet</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Newest Users */}
                    <div className="content-card duo-card">
                      <div className="card-header">
                        <h3>👥 Newest Users</h3>
                        <button
                          className="link-btn"
                          onClick={() => setActiveTab("users")}
                        >
                          View all →
                        </button>
                      </div>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(stats?.recentUsers || users.slice(0, 5)).map((user) => (
                              <tr key={user._id}>
                                <td className="font-semibold">{user.name}</td>
                                <td className="text-dim">{user.email}</td>
                                <td>
                                  <span
                                    className={`role-badge ${
                                      user.role === "admin" ? "role-admin" : "role-user"
                                    }`}
                                  >
                                    {user.role === "admin" ? "🛡️ Admin" : "User"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                              <tr>
                                <td colSpan="3" className="empty-cell">No users yet</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 2: MANAGE BLOGS */}
              {/* ========================================== */}
              {activeTab === "blogs" && (
                <div className="table-section">
                  <div className="table-toolbar">
                    <div className="search-bar">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search blogs by title or author..."
                        value={blogSearch}
                        onChange={(e) => setBlogSearch(e.target.value)}
                      />
                      {blogSearch && (
                        <button className="clear-btn" onClick={() => setBlogSearch("")}>
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="filter-group">
                      <label>Category:</label>
                      <select
                        value={blogCategoryFilter}
                        onChange={(e) => setBlogCategoryFilter(e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="count-tag">
                      Showing {filteredBlogs.length} of {blogs.length} blogs
                    </div>
                  </div>

                  <div className="content-card">
                    <div className="table-responsive">
                      <table className="admin-table management-table">
                        <thead>
                          <tr>
                            <th>Blog Title</th>
                            <th>Category</th>
                            <th>Author</th>
                            <th>Engagement</th>
                            <th>Published</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBlogs.map((blog) => (
                            <tr key={blog._id}>
                              <td>
                                <div className="blog-title-cell">
                                  {blog.image ? (
                                    <img
                                      src={blog.image}
                                      alt=""
                                      className="table-thumbnail"
                                      onError={(e) => (e.target.style.display = "none")}
                                    />
                                  ) : (
                                    <span className="thumb-placeholder">📝</span>
                                  )}
                                  <div className="blog-title-meta">
                                    <a
                                      href={`/blog/${blog._id}`}
                                      className="blog-link"
                                    >
                                      {blog.title}
                                    </a>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="category-badge-sm">{blog.category}</span>
                              </td>
                              <td>
                                <div className="user-cell">
                                  <span className="user-name">{blog.author?.name || "Unknown"}</span>
                                  <span className="user-email-dim">{blog.author?.email || ""}</span>
                                </div>
                              </td>
                              <td>
                                <div className="engagement-cell">
                                  <span>❤️ {blog.likesCount ?? (blog.likes?.length || 0)}</span>
                                  <span>💬 {blog.commentCount ?? 0}</span>
                                </div>
                              </td>
                              <td className="text-dim">
                                {blog.createdAt
                                  ? new Date(blog.createdAt).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td>
                                <div className="actions-cell">
                                  <a
                                    href={`/blog/${blog._id}`}
                                    className="btn-action btn-view"
                                    title="View Blog"
                                  >
                                    👁️ View
                                  </a>
                                  <button
                                    className="btn-action btn-delete"
                                    onClick={() => handleDeleteBlog(blog._id, blog.title)}
                                    title="Delete Blog"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {filteredBlogs.length === 0 && (
                            <tr>
                              <td colSpan="6" className="empty-cell">
                                No blogs matched your criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 3: MANAGE USERS */}
              {/* ========================================== */}
              {activeTab === "users" && (
                <div className="table-section">
                  <div className="table-toolbar">
                    <div className="search-bar">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                      {userSearch && (
                        <button className="clear-btn" onClick={() => setUserSearch("")}>
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="filter-group">
                      <label>Role:</label>
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                      >
                        <option value="All">All Roles</option>
                        <option value="admin">Admins Only</option>
                        <option value="user">Users Only</option>
                      </select>
                    </div>

                    <div className="count-tag">
                      Showing {filteredUsers.length} of {users.length} users
                    </div>
                  </div>

                  <div className="content-card">
                    <div className="table-responsive">
                      <table className="admin-table management-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Email Address</th>
                            <th>Role</th>
                            <th>Blogs Published</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => {
                            const isSelf = currentUser?.id === user._id || currentUser?._id === user._id;

                            return (
                              <tr key={user._id}>
                                <td>
                                  <div className="user-profile-cell">
                                    <div className="user-avatar">
                                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                    </div>
                                    <div className="user-name-wrapper">
                                      <span className="user-full-name">{user.name}</span>
                                      {isSelf && <span className="self-tag">(You)</span>}
                                    </div>
                                  </div>
                                </td>
                                <td className="text-dim">{user.email}</td>
                                <td>
                                  <span
                                    className={`role-badge ${
                                      user.role === "admin" ? "role-admin" : "role-user"
                                    }`}
                                  >
                                    {user.role === "admin" ? "🛡️ Admin" : "User"}
                                  </span>
                                </td>
                                <td className="text-center font-semibold">
                                  {user.blogCount ?? 0}
                                </td>
                                <td className="text-dim">
                                  {user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : "N/A"}
                                </td>
                                <td>
                                  <div className="actions-cell">
                                    {!isSelf ? (
                                      <>
                                        <button
                                          className={`btn-action ${
                                            user.role === "admin"
                                              ? "btn-demote"
                                              : "btn-promote"
                                          }`}
                                          onClick={() =>
                                            handleToggleUserRole(
                                              user._id,
                                              user.name,
                                              user.role
                                            )
                                          }
                                        >
                                          {user.role === "admin"
                                            ? "Demote to User"
                                            : "Make Admin"}
                                        </button>
                                        <button
                                          className="btn-action btn-delete"
                                          onClick={() =>
                                            handleDeleteUser(user._id, user.name)
                                          }
                                        >
                                          🗑️ Delete
                                        </button>
                                      </>
                                    ) : (
                                      <span className="action-disabled">Logged in</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {filteredUsers.length === 0 && (
                            <tr>
                              <td colSpan="6" className="empty-cell">
                                No users matched your search criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 4: MANAGE COMMENTS */}
              {/* ========================================== */}
              {activeTab === "comments" && (
                <div className="table-section">
                  <div className="table-toolbar">
                    <div className="search-bar">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search comments by text, author, or blog..."
                        value={commentSearch}
                        onChange={(e) => setCommentSearch(e.target.value)}
                      />
                      {commentSearch && (
                        <button className="clear-btn" onClick={() => setCommentSearch("")}>
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="count-tag">
                      Showing {filteredComments.length} of {comments.length} comments
                    </div>
                  </div>

                  <div className="content-card">
                    <div className="table-responsive">
                      <table className="admin-table management-table">
                        <thead>
                          <tr>
                            <th>Comment Content</th>
                            <th>Author</th>
                            <th>Blog Post</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredComments.map((comment) => (
                            <tr key={comment._id}>
                              <td className="comment-content-cell">
                                <span className="comment-quote">“{comment.content}”</span>
                              </td>
                              <td>
                                <div className="user-cell">
                                  <span className="user-name">
                                    {comment.user?.name || "Unknown"}
                                  </span>
                                  <span className="user-email-dim">
                                    {comment.user?.email || ""}
                                  </span>
                                </div>
                              </td>
                              <td>
                                {comment.blog ? (
                                  <a
                                    href={`/blog/${comment.blog._id}`}
                                    className="blog-link"
                                  >
                                    {comment.blog.title || "Untitled Blog"}
                                  </a>
                                ) : (
                                  <span className="text-dim">Deleted Blog</span>
                                )}
                              </td>
                              <td className="text-dim">
                                {comment.createdAt
                                  ? new Date(comment.createdAt).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td>
                                <button
                                  className="btn-action btn-delete"
                                  onClick={() => handleDeleteComment(comment._id)}
                                  title="Delete Comment"
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          ))}

                          {filteredComments.length === 0 && (
                            <tr>
                              <td colSpan="5" className="empty-cell">
                                No comments found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
