import { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      console.log("Login response:", data);

      if (response.ok) {

        // Save JWT token
        localStorage.setItem("token", data.token);

        // Save user information
        if (data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );
        }

        alert("Login successful! 🎉");

        // Go to Blog List page
        window.location.href = "/blogs";

      } else {
        alert(
          data.message ||
          "Invalid email or password"
        );
      }

    } catch (error) {
      console.log("Login error:", error);

      alert(
        "Server error. Please try again."
      );
    }
  };

  return (
    <div className="login-container">

      <div className="login-box">

        <h1>Welcome Back</h1>

        <p className="login-subtitle">
          Login to continue to BLOGIFY
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button type="submit">
            🔐 Login
          </button>

        </form>

        <p className="register-link">
          Don't have an account?{" "}

          <a href="/register">
            Register
          </a>
        </p>

      </div>

    </div>
  );
}

export default Login;