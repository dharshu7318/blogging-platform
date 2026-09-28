import "./Home.css";

function Home() {

  const token = localStorage.getItem("token");

  const handleProtectedNavigation = (page) => {
    if (!token) {
      alert("Please login first 🔐");
      window.location.href = "/login";
      return;
    }

    window.location.href = page;
  };

  return (
    <div className="home-page">

      {/* HERO SECTION */}
      <section className="hero-section">

        <div className="hero-content">

          <p className="hero-small-title">
            WELCOME TO BLOGIFY
          </p>

          <h1>
            Write. Share.
            <span> Inspire.</span>
          </h1>

          <p className="hero-description">
            A simple place to share your thoughts, stories,
            experiences and ideas with the world.
          </p>

          <div className="hero-buttons">

            {/* START WRITING */}
            <button
              className="primary-button"
              onClick={() =>
                handleProtectedNavigation("/create")
              }
            >
              ✍️ Start Writing
            </button>

            {/* EXPLORE BLOGS */}
            <button
              className="secondary-button"
              onClick={() =>
                handleProtectedNavigation("/blogs")
              }
            >
              📖 Explore Blogs
            </button>

          </div>

        </div>


        <div className="hero-illustration">

          <div className="floating-card card-one">
            ✨ Ideas
          </div>

          <div className="book">
            📚
          </div>

          <div className="floating-card card-two">
            💡 Stories
          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section className="features-section">

        <div className="section-heading">

          <p>WHY BLOGIFY?</p>

          <h2>
            Everything you need to share your story
          </h2>

        </div>

        <div className="features-container">

          <div className="feature-card">
            <div className="feature-icon">✍️</div>

            <h3>Create</h3>

            <p>
              Write and publish your own blogs
              with an easy-to-use editor.
            </p>
          </div>


          <div className="feature-card">
            <div className="feature-icon">🌎</div>

            <h3>Share</h3>

            <p>
              Share your thoughts and experiences
              with the blogging community.
            </p>
          </div>


          <div className="feature-card">
            <div className="feature-icon">❤️</div>

            <h3>Connect</h3>

            <p>
              Discover interesting stories and
              interact with other bloggers.
            </p>
          </div>

        </div>

      </section>


      {/* CATEGORIES */}
      <section className="categories-section">

        <div className="section-heading">

          <p>EXPLORE</p>

          <h2>
            Discover different topics
          </h2>

        </div>

        <div className="categories-container">

          <div
            className="category-card"
            onClick={() =>
              handleProtectedNavigation("/blogs")
            }
          >
            💻
            <span>Technology</span>
          </div>


          <div
            className="category-card"
            onClick={() =>
              handleProtectedNavigation("/blogs")
            }
          >
            ✈️
            <span>Travel</span>
          </div>


          <div
            className="category-card"
            onClick={() =>
              handleProtectedNavigation("/blogs")
            }
          >
            🍕
            <span>Food</span>
          </div>


          <div
            className="category-card"
            onClick={() =>
              handleProtectedNavigation("/blogs")
            }
          >
            🌱
            <span>Lifestyle</span>
          </div>


          <div
            className="category-card"
            onClick={() =>
              handleProtectedNavigation("/blogs")
            }
          >
            🎓
            <span>Education</span>
          </div>


          <div
            className="category-card"
            onClick={() =>
              handleProtectedNavigation("/blogs")
            }
          >
            🎨
            <span>Creative</span>
          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="cta-section">

        <h2>
          Have a story to tell?
        </h2>

        <p>
          Turn your ideas into words and
          share them with the world.
        </p>

        <button
          onClick={() =>
            handleProtectedNavigation("/create")
          }
        >
          Start Writing →
        </button>

      </section>


      {/* FOOTER */}
      <footer className="home-footer">

        <h2>BLOGIFY</h2>

        <p>
          Write. Share. Inspire.
        </p>

        <p className="copyright">
          © 2026 BLOGIFY. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default Home;