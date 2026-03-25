import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [counts, setCounts] = useState({});
  const [totalArticles, setTotalArticles] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/news")
      .then((res) => res.json())
      .then((data) => {
        setFeaturedNews(data.featured_news);
        setNews(data.news || []);
        setCounts(data.categories_count || {});
        setTotalArticles(data.total_articles || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
        setLoading(false);
      });
  }, []);

  const filteredNews =
    selectedCategory === "All"
      ? news
      : news.filter((item) => item.category === selectedCategory);

  const categories = [
    "All",
    "Companies & Products",
    "Government & Tariff",
    "International",
    "Others",
  ];

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-content">
          <p className="mini-tag">Global Energy Intelligence</p>
          <h1>Renewable Energy News Aggregator</h1>
          <p className="hero-subtitle">
            A smart dashboard for tracking the latest renewable energy developments
            across policy, business, international markets, and industry updates.
          </p>

          <div className="hero-actions">
            <button
              className="action-btn primary-btn"
              onClick={() => window.location.reload()}
            >
              Refresh News
            </button>
            <button
              className="action-btn secondary-btn"
              onClick={() =>
                document
                  .getElementById("news-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore News
            </button>
            <button
              className="action-btn primary-btn"
              onClick={() => window.print()}
            >
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <section className="stats-section">
        <div className="stat-card">
          <span className="stat-number">{totalArticles}</span>
          <span className="stat-label">Total Articles</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{counts["Government & Tariff"] || 0}</span>
          <span className="stat-label">Govt & Tariff</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{counts["Companies & Products"] || 0}</span>
          <span className="stat-label">Companies</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{counts["International"] || 0}</span>
          <span className="stat-label">International</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{counts["Others"] || 0}</span>
          <span className="stat-label">Others</span>
        </div>
      </section>

      {featuredNews && (
        <section className="featured-section">
          <div className="section-header">
            <h2>Featured Story</h2>
          </div>

          <div className="featured-card">
            <div className="featured-badge">{featuredNews.category}</div>
            <p className="featured-source">Source: {featuredNews.source}</p>
            <h3>{featuredNews.title}</h3>
            <p className="featured-summary">{featuredNews.summary}</p>
            <div className="featured-meta">
              <span>Published: {featuredNews.published}</span>
              <a href={featuredNews.link} target="_blank" rel="noreferrer">
                Read Full Article
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="news-section" id="news-section">
        <div className="section-header">
          <h2>Latest News</h2>
          <p>Filter articles by category</p>
        </div>

        <div className="filter-bar">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="status-text">Loading latest news...</p>
        ) : filteredNews.length === 0 ? (
          <p className="status-text">No articles found for this category.</p>
        ) : (
          <div className="news-container">
            {filteredNews.map((item, index) => (
              <div className="news-card" key={index}>
                <span className="category-badge">{item.category}</span>
                <p className="news-source">Source: {item.source}</p>
                <h3>{item.title}</h3>
                <p className="news-date">Published: {item.published}</p>
                <p className="news-summary">{item.summary}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="read-more"
                >
                  Read More
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <h3>Renewable Energy News Aggregator</h3>
        <p>Built using React and Flask for tracking renewable energy developments.</p>
      </footer>
    </div>
  );
}

export default App;