import "./Navbar.css";

function Navbar() {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = null;
  }
  const isAdmin = user && user.role === "admin";

 const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/";
};

  return (
    <nav className="navbar">

      <div
        className="navbar-logo"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        BLOGIFY
      </div>

      <div className="navbar-links">

        <a href="/">Home</a>

        <a href="/blogs">Blogs</a>

        {token && (
          <>
            <a href="/create">Create Blog</a>

            <a href="/myblogs">My Blogs</a>

            <a href="/profile">Profile</a>

            {isAdmin && (
              <a href="/admin" className="navbar-admin-link">
                🛡️ Admin
              </a>
            )}

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

        {!token && (
          <>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;