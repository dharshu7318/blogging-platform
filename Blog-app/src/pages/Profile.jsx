import { useEffect, useState } from "react";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.log("User data error:", error);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-icon">👤</div>

          <h1>My Profile</h1>

          <p>
            Please login to view your profile.
          </p>

          <button
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-card">

        <div className="profile-icon">
          👤
        </div>

        <h1>My Profile</h1>

        <p className="profile-subtitle">
          Your BLOGIFY account
        </p>

        <div className="profile-info">

          <div className="profile-row">
            <span>👤 Name</span>
            <strong>
              {user.name || "User"}
            </strong>
          </div>

          <div className="profile-row">
            <span>📧 Email</span>
            <strong>
              {user.email || "Not available"}
            </strong>
          </div>

          <div className="profile-row">
            <span>🛡️ Role</span>
            <strong style={{
              color: user.role === "admin" ? "#0284c7" : "#64748b",
              fontWeight: 700,
              textTransform: "capitalize"
            }}>
              {user.role === "admin" ? "🛡️ Administrator" : "Standard User"}
            </strong>
          </div>

        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {user.role === "admin" ? (
            <button
              style={{ background: "#0284c7" }}
              onClick={() => {
                window.location.href = "/admin";
              }}
            >
              🛡️ Open Admin Dashboard
            </button>
          ) : (
            <button
              style={{ background: "#475569" }}
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  const res = await fetch("http://localhost:5000/api/admin/promote-me", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
                  const data = await res.json();
                  if (res.ok) {
                    const updatedUser = { ...user, role: "admin" };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    alert("🎉 Success! Your account is now an Administrator.");
                  } else {
                    alert(data.message || "Failed to enable admin mode");
                  }
                } catch (err) {
                  alert("Server error connecting to backend.");
                }
              }}
            >
              ⚡ Enable Admin Mode (Developer)
            </button>
          )}

          <button
            onClick={() => {
              window.location.href = "/myblogs";
            }}
          >
            📝 View My Blogs
          </button>
        </div>

      </div>

    </div>
  );
}

export default Profile;