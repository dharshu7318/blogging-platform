import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Blogs from "./pages/Blogs";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CreateBlog from "./pages/CreateBlog";
import BlogDetails from "./pages/BlogDetails";
import EditBlog from "./pages/EditBlog";
import MyBlogs from "./pages/MyBlogs";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const path = window.location.pathname;

  // Check whether user is logged in
  const token = localStorage.getItem("token");

  // Protected pages
  const protectedPages = [
  "/blogs",
  "/create",
  "/myblogs",
  "/profile",
  "/admin"
];

  // Check if current page needs login
  const isProtectedPage =
    protectedPages.includes(path) ||
    path.startsWith("/edit/");

  // If user is not logged in and tries to open
  // a protected page, send them to Home
  if (!token && isProtectedPage) {
  window.location.href = "/login";
  return null;
}
  return (
    <div>
      <Navbar />

      {path === "/register" ? (
        <Register />

      ) : path === "/login" ? (
        <Login />

      ) : path === "/blogs" ? (
        <Blogs />

      ) : path === "/create" ? (
        <CreateBlog />

      ) : path === "/myblogs" ? (
        <MyBlogs />

      ) : path === "/profile" ? (
        <Profile />

      ) : path === "/admin" ? (
        <AdminDashboard />

      ) : path.startsWith("/edit/") ? (
        <EditBlog />

      ) : path.startsWith("/blog/") ? (
        <BlogDetails />

      ) : (
        <Home />
      )}
    </div>
  );
}

export default App;