import { useEffect, useState, useMemo } from "react";
import "./App.css";
const BRAND = "Thuthan";
const BRAND_FULL = "Thuthan Renewable Energy News";
function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priorities, setPriorities] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDashboard, setIsDashboard] = useState(false);
  const [removedArticles, setRemovedArticles] = useState([]);
  const [lastFetch, setLastFetch] = useState(null);
  useEffect(() => {
    fetchNews();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const fetchNews = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/news")
      .then((res) => res.json())
      .then((data) => {
        const newsItems = data.news || [];
        const featuredNews = data.featured_news;
        const allNews = featuredNews ? [featuredNews, ...newsItems] : newsItems;
        setNews(allNews);
        setLastFetch(new Date());
        const initialPriorities = {};
        allNews.forEach((item, idx) => {
          initialPriorities[idx] = item.priority || 3;
        });
        setPriorities(initialPriorities);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
        setLoading(false);
      });
  };
  const navCategories = [
    { id: "All", label: "All" },
    { id: "Companies & Products", label: "Company & Products" },
    { id: "Government & Tariff", label: "Govt & Tariff" },
    { id: "International", label: "International" },
    { id: "Others", label: "Others" },
  ];
  const tagColors = {
    "Companies & Products": "tag-green",
    "Government & Tariff": "tag-navy",
    "International": "tag-amber",
    "Others": "tag-slate",
  };
  const getRelativeTime = (published) => {
    if (!published) return "Recently";
    try {
      const date = new Date(published);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return published;
    } catch {
      return "Recently";
    }
  };
  const estimateReadingTime = (text) => {
    if (!text) return "1 min read";
    const words = text.split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  };
  const normalizeCategory = (category) => {
    if (category === "International News") return "International";
    return category || "Others";
  };
  const truncate = (text, max) => {
    if (!text) return "";
    return text.length > max ? text.slice(0, max).trim() + "..." : text;
  };
  const handlePriorityChange = (index, priority) => {
    setPriorities((prev) => ({ ...prev, [index]: priority }));
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return "#dc2626";
      case 2: return "#ea580c";
      case 3: return "#ca8a04";
      case 4: return "#16a34a";
      case 5: return "#059669";
      default: return "#ca8a04";
    }
  };
  const handleRemoveArticle = (index) => {
    const articleToRemove = news[index];
    setRemovedArticles((prev) => [...prev, articleToRemove]);
    setNews((prev) => prev.filter((_, i) => i !== index));
  };
  const handleRestoreArticle = (article) => {
    setNews((prev) => [article, ...prev]);
    setRemovedArticles((prev) => prev.filter((a) => a !== article));
  };
  const getScoreColor = (score) => {
    if (score >= 0.8) return "#059669";
    if (score >= 0.6) return "#16a34a";
    if (score >= 0.4) return "#ca8a04";
    if (score >= 0.2) return "#ea580c";
    return "#dc2626";
  };
  const filteredNews = useMemo(() => {
    let filtered =
      selectedCategory === "All"
        ? news
        : news.filter((item) => normalizeCategory(item.category) === selectedCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.summary?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [news, selectedCategory, searchQuery]);
  const featuredArticle = filteredNews[0];
  const mainArticles = filteredNews.slice(1, 4);
  const gridArticles = filteredNews.slice(4, 10);
  const handleSaveRetrain = () => {
    const updatedNews = news.map((item, idx) => ({
      ...item,
      priority: priorities[idx] || 3,
    }));
    console.log("Save & Retrain clicked:", updatedNews);
    alert("Priorities saved! (Backend integration pending)");
  };
  const handleWhatsApp = () => {
    const highPriority = news.filter((_, idx) => (priorities[idx] || 3) >= 4);
    const message = `${BRAND_FULL}:\n\n${highPriority
      .slice(0, 3)
      .map((n, i) => `${i + 1}. ${n.title}`)
      .join("\n")}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };
  const handleEmail = () => {
    const subject = `${BRAND_FULL} Digest`;
    const highPriority = news.filter((_, idx) => (priorities[idx] || 3) >= 4);
    const body = highPriority
      .slice(0, 3)
      .map((n, i) => `${i + 1}. ${n.title}\n${n.link}`)
      .join("\n\n");
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  const formatDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const formatTime = (date) => {
    if (!date) return "—";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getNextFetchTime = () => {
    const next = new Date(currentTime);
    next.setMinutes(next.getMinutes() + 30);
    return formatTime(next);
  };
  const activeCount = news.length;
  const removedCount = removedArticles.length;
  const highPriorityCount = news.filter((_, idx) => (priorities[idx] || 3) >= 4).length;
  if (isDashboard) {
    return (
      <div className="dashboard">
        <header className="dash-header">
          <div className="dash-header-inner">
            <div className="dash-brand">
              <span className="dash-brand-icon">🌿</span>
              <span className="dash-brand-text">{BRAND_FULL} Dashboard</span>
            </div>
            <div className="dash-header-actions">
              <button
                className="dash-view-btn"
                onClick={() => setIsDashboard(false)}
              >
                View Public Page
              </button>
            </div>
          </div>
        </header>
        <div className="dash-toolbar">
          <div className="dash-toolbar-actions">
            <button className="dash-btn dash-btn-primary" onClick={handleSaveRetrain}>
              Save & Retrain
            </button>
            <button className="dash-btn dash-btn-secondary" onClick={fetchNews}>
              Refresh
            </button>
            <button className="dash-btn dash-btn-secondary" onClick={handleWhatsApp}>
              WhatsApp
            </button>
            <button className="dash-btn dash-btn-secondary" onClick={handleEmail}>
              Send Email
            </button>
            <button
              className="dash-btn dash-btn-accent"
              onClick={() => window.open("http://127.0.0.1:8000/download", "_blank")}
            >
              Download PDF
            </button>
          </div>
        </div>
        <div className="dash-stats">
          <div className="dash-stat">
            <span className="dash-stat-value">{activeCount}</span>
            <span className="dash-stat-label">Active Articles</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{highPriorityCount}</span>
            <span className="dash-stat-label">High Priority</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{removedCount}</span>
            <span className="dash-stat-label">Removed</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{formatTime(lastFetch)}</span>
            <span className="dash-stat-label">Last Fetch</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{getNextFetchTime()}</span>
            <span className="dash-stat-label">Next Fetch</span>
          </div>
        </div>
        <main className="dash-main">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Article Queue</h2>
            <span className="dash-count">{news.length} articles</span>
          </div>
          {loading ? (
            <div className="dash-loading">
              <div className="spinner"></div>
              <p>Loading articles...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="dash-empty">
              <p>No articles in queue.</p>
            </div>
          ) : (
            <div className="dash-article-list">
              {news.map((item, idx) => (
                <div key={idx} className="dash-article-row">
                  <div className="dash-article-main">
                    <span className={`dash-tag ${tagColors[item.category] || "tag-slate"}`}>
                      {normalizeCategory(item.category)}
                    </span>
                    <div className="dash-article-content">
                      <h3 className="dash-article-title">{truncate(item.title, 100)}</h3>
                      <p className="dash-article-summary">{truncate(item.summary, 140)}</p>
                      <div className="dash-article-meta">
                        <span className="meta-bold">{item.source}</span>
                        <span className="meta-dot">·</span>
                        <span>{getRelativeTime(item.published)}</span>
                        <span className="meta-dot">·</span>
                        <span>{estimateReadingTime(item.summary)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="dash-article-controls">
                    <div
                      className="dash-score"
                      style={{
                        backgroundColor: `${getScoreColor(item.score)}15`,
                        color: getScoreColor(item.score),
                      }}
                    >
                      <span className="score-label">Score</span>
                      <span className="score-value">{item.score?.toFixed(4) || "1.0000"}</span>
                    </div>
                    <div className="dash-priority">
                      <span className="priority-label">Priority</span>
                      <div className="priority-btns">
                        {[1, 2, 3, 4, 5].map((p) => (
                          <button
                            key={p}
                            className={`priority-btn ${priorities[idx] === p ? "active" : ""}`}
                            style={{
                              backgroundColor: priorities[idx] === p ? getPriorityColor(p) : "transparent",
                              borderColor: getPriorityColor(p),
                              color: priorities[idx] === p ? "white" : getPriorityColor(p),
                            }}
                            onClick={() => handlePriorityChange(idx, p)}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="dash-read-link"
                    >
                      Read Article
                    </a>
                    <button
                      className="dash-remove-btn"
                      onClick={() => handleRemoveArticle(idx)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {removedArticles.length > 0 && (
            <div className="dash-removed">
              <div className="dash-section-header">
                <h2 className="dash-section-title">Removed Articles</h2>
                <span className="dash-count">{removedArticles.length} removed</span>
              </div>
              <div className="dash-article-list">
                {removedArticles.map((item, idx) => (
                  <div key={idx} className="dash-article-row dash-article-removed">
                    <div className="dash-article-main">
                      <span className={`dash-tag ${tagColors[item.category] || "tag-slate"}`}>
                        {normalizeCategory(item.category)}
                      </span>
                      <div className="dash-article-content">
                        <h3 className="dash-article-title">{truncate(item.title, 80)}</h3>
                        <div className="dash-article-meta">
                          <span className="meta-bold">{item.source}</span>
                        </div>
                      </div>
                    </div>
                    <div className="dash-article-controls">
                      <button
                        className="dash-restore-btn"
                        onClick={() => handleRestoreArticle(item)}
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        <footer className="dash-footer">
          <span>{BRAND_FULL} Dashboard</span>
          <span className="footer-dot">·</span>
          <span>Last updated {currentTime.toLocaleTimeString()}</span>
        </footer>
      </div>
    );
  }
  return (
    <div className="homepage">
      <header className="nav-header">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="nav-brand-icon">🌿</span>
            <span className="nav-brand-text">{BRAND}</span>
          </div>
          <nav className="nav-cats">
            {navCategories.map((cat) => (
              <button
                key={cat.id}
                className={`nav-cat ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              className="nav-dash-btn"
              onClick={() => setIsDashboard(true)}
            >
              Dashboard
            </button>
            <div className="nav-search">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className="nav-pdf-btn"
              onClick={() => window.open("http://127.0.0.1:8000/download", "_blank")}
            >
              PDF
            </button>
          </div>
        </div>
      </header>
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-date">{formatDate()}</p>
          <h1 className="hero-title">{BRAND_FULL}</h1>
          <p className="hero-subtitle">
            Curated insights on renewable energy transition, policy updates,
            company developments, and international green initiatives.
          </p>
        </div>
      </section>
      <main className="main">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading latest news...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="empty">
            <p>No articles found for this selection.</p>
          </div>
        ) : (
          <>
            <section className="featured-section">
              <div className="section-head">
                <h2 className="section-title">Featured</h2>
                <div className="section-line"></div>
              </div>
              <div className="featured-grid">
                {featuredArticle && (
                  <article className="card card-featured">
                    <a href={featuredArticle.link} target="_blank" rel="noreferrer">
                      <div className="card-img">
                        <img
                          src={`https://picsum.photos/seed/${featuredArticle.title?.slice(0, 10) || "feat"}/800/420`}
                          alt=""
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.classList.add("img-placeholder");
                          }}
                        />
                        <div className="card-img-overlay"></div>
                        <span className={`card-tag ${tagColors[featuredArticle.category] || "tag-slate"}`}>
                          {normalizeCategory(featuredArticle.category)}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="card-meta">
                          <span className="meta-bold">{featuredArticle.source}</span>
                          <span className="meta-dot">·</span>
                          <span>{getRelativeTime(featuredArticle.published)}</span>
                        </div>
                        <h2 className="card-title">{featuredArticle.title}</h2>
                        <p className="card-text">{featuredArticle.summary}</p>
                        <span className="card-link-text">Read Full Article →</span>
                      </div>
                    </a>
                  </article>
                )}
                <div className="featured-side">
                  {mainArticles.map((item, idx) => (
                    <article key={idx} className="card card-side">
                      <a href={item.link} target="_blank" rel="noreferrer">
                        <div className="side-img">
                          <img
                            src={`https://picsum.photos/seed/${item.title?.slice(0, 8) || idx}/400/250`}
                            alt=""
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.classList.add("img-placeholder");
                            }}
                          />
                        </div>
                        <div className="card-body">
                          <span className={`card-tag card-tag-sm ${tagColors[item.category] || "tag-slate"}`}>
                            {normalizeCategory(item.category)}
                          </span>
                          <h3 className="card-title">{truncate(item.title, 70)}</h3>
                          <p className="card-text">{truncate(item.summary, 100)}</p>
                          <div className="card-meta">
                            <span className="meta-bold">{item.source}</span>
                            <span className="meta-dot">·</span>
                            <span>{getRelativeTime(item.published)}</span>
                          </div>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            </section>
            <section className="articles-section">
              <div className="section-head">
                <h2 className="section-title">Latest News</h2>
                <div className="section-line"></div>
              </div>
              <div className="articles-grid">
                {gridArticles.map((item, idx) => (
                  <article key={idx} className="card card-article">
                    <a href={item.link} target="_blank" rel="noreferrer">
                      <div className="card-img">
                        <img
                          src={`https://picsum.photos/seed/${item.title?.slice(0, 8) || idx + 10}/560/300`}
                          alt=""
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.classList.add("img-placeholder");
                          }}
                        />
                        <span className={`card-tag ${tagColors[item.category] || "tag-slate"}`}>
                          {normalizeCategory(item.category)}
                        </span>
                      </div>
                      <div className="card-body">
                        <h3 className="card-title">{truncate(item.title, 65)}</h3>
                        <p className="card-text">{truncate(item.summary, 90)}</p>
                        <div className="card-meta">
                          <span className="meta-bold">{item.source}</span>
                          <span className="meta-dot">·</span>
                          <span>{getRelativeTime(item.published)}</span>
                        </div>
                      </div>
                    </a>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">🌿 {BRAND}</span>
            <p className="footer-tagline">{BRAND_FULL}</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Content</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Guidelines</a>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <a href="#">About</a>
              <a href="#">Submit News</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 {BRAND_FULL}. All rights reserved.</p>
          <p>Powered by AI-curated news aggregation</p>
        </div>
      </footer>
    </div>
  );
}
export default App;