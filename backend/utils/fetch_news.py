import re
import html
import feedparser  # type: ignore
from dateutil import parser  # type: ignore
from datetime import datetime, timedelta
from utils.categorize import categorize_news

RSS_FEEDS = [
    "https://news.google.com/rss/search?q=renewable+energy+when:1d&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=solar+energy+when:1d&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=wind+energy+when:1d&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=green+hydrogen+when:1d&hl=en-IN&gl=IN&ceid=IN:en"
]

# ------------------ CLEANING FUNCTIONS ------------------

def strip_html_tags(text):
    return re.sub(r"<.*?>", "", text or "").strip()

def clean_text(text):
    text = html.unescape(text or "")
    text = strip_html_tags(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def normalize_title(title):
    title = clean_text(title).lower()
    parts = title.split(" - ")
    if len(parts) > 1:
        title = parts[0].strip()
    return title

# ------------------ SOURCE EXTRACTION ------------------

def extract_source(entry, title=""):
    source = "Google News"

    if hasattr(entry, "source") and isinstance(entry.source, dict):
        source = entry.source.get("title", "Google News")

    cleaned_title = clean_text(title)

    if " - " in cleaned_title:
        parts = cleaned_title.split(" - ")
        if len(parts[-1]) < 40:
            source = parts[-1].strip()

    return source

# ------------------ SUMMARY CLEANING ------------------

def clean_summary(summary, title=""):
    summary = clean_text(summary)

    if not summary:
        return "No summary available."

    clean_title = clean_text(title)
    if clean_title and summary.lower().startswith(clean_title.lower()):
        summary = summary[len(clean_title):].strip(" -:|.")

    if len(summary.split()) < 4:
        return "Click to read the full article."

    # Keep 2–3 lines
    if len(summary) > 150:
        summary = summary[:150].rsplit(" ", 1)[0] + "..."

    return summary

# ------------------ REGION DETECTION ------------------

def detect_region(title, summary):
    text = (title + " " + summary).lower()

    if "india" in text:
        return "India"
    return "Global"

# ------------------ MAIN FUNCTION ------------------

def fetch_news():
    news_items = []
    seen_titles = set()
    last_24_hours = datetime.utcnow() - timedelta(hours=24)

    for feed_url in RSS_FEEDS:
        feed = feedparser.parse(feed_url)

        for entry in feed.entries:
            try:
                published_raw = getattr(entry, "published", None)
                if not published_raw:
                    continue

                published = parser.parse(published_raw)
                published_naive = published.replace(tzinfo=None)

                # ⏱ Only last 24 hours
                if published_naive < last_24_hours:
                    continue

                original_title = clean_text(entry.title)
                normalized_title = normalize_title(original_title)

                # 🚫 Remove duplicates
                if normalized_title in seen_titles:
                    continue

                raw_summary = entry.get("summary", "")
                summary = clean_summary(raw_summary, original_title)
                source = extract_source(entry, original_title)
                category = categorize_news(original_title, summary)

                # ⚡ FAST (no requests call here)
                link = entry.link

                news_items.append({
                    "title": original_title,
                    "link": link,
                    "published": published.strftime("%d %b %Y, %I:%M %p"),
                    "published_sort": published_naive,
                    "summary": summary,
                    "category": category,
                    "source": source,
                    "region": detect_region(original_title, summary)
                })

                seen_titles.add(normalized_title)

            except Exception:
                continue

    # ✅ Sort properly using datetime
    news_items.sort(key=lambda x: x["published_sort"], reverse=True)

    # Remove helper field before sending
    for item in news_items:
        item.pop("published_sort", None)

    # Limit results
    return news_items[:40]