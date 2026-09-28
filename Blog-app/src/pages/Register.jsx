import { useState } from "react";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = () => {
    if (password.length === 0) {
      return "";
    }

    if (password.length < 6) {
      return "Weak";
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial
    ].filter(Boolean).length;

    if (password.length >= 8 && score >= 3) {
      return "Strong";
    }

    if (password.length >= 6 && score >= 2) {
      return "Medium";
    }

    return "Weak";
  };

  const passwordStrength = getPasswordStrength();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    // Strong password validation
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!strongPassword.test(password)) {
      alert(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        alert("Registration successful! 🎉");

        setName("");
        setEmail("");
        setPassword("");
        setShowPassword(false);

        window.location.href = "/login";
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.log("Registration error:", error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="register-container">

      <div className="register-box">

        <h1>Create Account</h1>

        <p className="register-subtitle">
          Join BLOGIFY and start sharing your stories
        </p>

        <form onSubmit={handleRegister}>

          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>

          <div className="password-wrapper">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="eye-button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "🙈" : "👁️"}
            </button>

          </div>

          {/* Password strength */}

          {password && (
            <div className="password-strength">

              <div
                className={`strength-bar ${passwordStrength.toLowerCase()}`}
              ></div>

              <span>
                Password strength:{" "}
                <strong>{passwordStrength}</strong>
              </span>

            </div>
          )}

          {/* Requirements */}

          <div className="password-requirements">

            <p>Password must contain:</p>

            <span className={password.length >= 8 ? "valid" : ""}>
              {password.length >= 8 ? "✓" : "○"} 8+ characters
            </span>

            <span className={/[A-Z]/.test(password) ? "valid" : ""}>
              {/[A-Z]/.test(password) ? "✓" : "○"} Uppercase letter
            </span>

            <span className={/[a-z]/.test(password) ? "valid" : ""}>
              {/[a-z]/.test(password) ? "✓" : "○"} Lowercase letter
            </span>

            <span className={/[0-9]/.test(password) ? "valid" : ""}>
              {/[0-9]/.test(password) ? "✓" : "○"} Number
            </span>

            <span
              className={
                /[!@#$%^&*(),.?":{}|<>]/.test(password)
                  ? "valid"
                  : ""
              }
            >
              {/[!@#$%^&*(),.?":{}|<>]/.test(password)
                ? "✓"
                : "○"}{" "}
              Special character
            </span>

          </div>

          <button
            type="submit"
            className="register-button"
          >
            Create Account
          </button>

        </form>

        <p className="login-link">
          Already have an account?{" "}
          <a href="/login">Login</a>
        </p>

      </div>

    </div>
  );
}

export default Register;