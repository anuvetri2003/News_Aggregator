from flask import Flask, render_template, send_file, request, redirect, url_for  # type: ignore
from utils.fetch_news import fetch_news
from utils.pdf_generator import generate_pdf
import json
import os
app = Flask(__name__)
SAVE_FILE = os.path.join(os.path.dirname(__file__), "saved_news.json")
def load_saved_news():
    if not os.path.exists(SAVE_FILE):
        with open(SAVE_FILE, "w", encoding="utf-8") as file:
            json.dump([], file)
    try:
        with open(SAVE_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except:
        return []
def write_saved_news(news_list):
    with open(SAVE_FILE, "w", encoding="utf-8") as file:
        json.dump(news_list, file, indent=2, ensure_ascii=False)
def save_current_news(news):
    saved_news = load_saved_news()
    existing_links = {item.get("link") for item in saved_news}
    for item in news:
        if item.get("link") not in existing_links:
            saved_news.append({
                "title": item.get("title", ""),
                "summary": item.get("summary", ""),
                "source": item.get("source", ""),
                "link": item.get("link", ""),
                "category": item.get("category", ""),
                "published": item.get("published", ""),
                "region": item.get("region", "")
            })
    write_saved_news(saved_news)
@app.route("/delete-saved-news", methods=["POST"])
def delete_saved_news():
    link = request.form.get("link")
    saved = load_saved_news()
    updated_saved = [item for item in saved if item.get("link") != link]
    write_saved_news(updated_saved)
    return redirect(url_for("saved_news"))
def normalize_category(category):
    if not category:
        return "Others"
    category = str(category).strip()
    if category in ["International", "International News"]:
        return "International News"
    if category in ["Government", "Govt", "Govt & Tariff", "Government & Tariff"]:
        return "Government & Tariff"
    if category in ["Company", "Companies", "Companies & Products"]:
        return "Companies & Products"
    if category == "Others":
        return "Others"
    return "Others"
def normalize_news_list(news):
    for item in news:
        item["category"] = normalize_category(item.get("category"))
    return news
def get_category_counts(news):
    return {
        "All": len(news),
        "Companies & Products": len([n for n in news if n["category"] == "Companies & Products"]),
        "Government & Tariff": len([n for n in news if n["category"] == "Government & Tariff"]),
        "International News": len([n for n in news if n["category"] == "International News"]),
        "Others": len([n for n in news if n["category"] == "Others"]),
    }
def get_first_category_news(news, category, exclude_titles=None):
    exclude_titles = exclude_titles or set()
    for item in news:
        if item["title"] in exclude_titles:
            continue
        if item["category"] == category:
            return item
    return None
def get_extra_news(news, exclude_titles=None):
    exclude_titles = exclude_titles or set()
    for item in news:
        if item["title"] not in exclude_titles:
            return item
    return None
@app.route("/")
def home():
    news = fetch_news()
    news = normalize_news_list(news)
    featured_news = news[0] if len(news) > 0 else None
    used_titles = set()
    if featured_news:
        used_titles.add(featured_news["title"])
    category_sections = []
    for label in [
        "Companies & Products",
        "Government & Tariff",
        "International News",
        "Others"
    ]:
        item = get_first_category_news(news, label, used_titles)
        if item:
            category_sections.append({
                "label": label,
                "item": item
            })
            used_titles.add(item["title"])
    extra_news = get_extra_news(news, used_titles)
    return render_template(
        "index.html",
        featured_news=featured_news,
        category_sections=category_sections,
        extra_news=extra_news
    )
@app.route("/dashboard")
def dashboard():
    news = fetch_news()
    news = normalize_news_list(news)
    selected_category = normalize_category(request.args.get("category", "All"))
    if request.args.get("category", "All") == "All":
        selected_category = "All"
    return render_template(
        "dashboard.html",
        news=news,
        total_articles=len(news),
        categories_count=get_category_counts(news),
        selected_category=selected_category
    )
@app.route("/save-single-news", methods=["POST"])
def save_single_news():
    data = {
        "title": request.form.get("title"),
        "summary": request.form.get("summary"),
        "source": request.form.get("source"),
        "link": request.form.get("link"),
        "category": request.form.get("category"),
        "published": request.form.get("published"),
        "region": request.form.get("region"),
    }
    saved_news = load_saved_news()
    existing_links = {item.get("link") for item in saved_news}
    if data["link"] not in existing_links:
        saved_news.append(data)
        write_saved_news(saved_news)
    return redirect(url_for("saved_news")) # type: ignore
@app.route("/saved-news")
def saved_news():
    saved = load_saved_news()
    return render_template("saved.html", saved_news=saved)
@app.route("/download")
def download_pdf():
    news = fetch_news()
    news = normalize_news_list(news)
    file_path = generate_pdf(news)
    return send_file(file_path, as_attachment=True)
if __name__ == "__main__":
    app.run(debug=True, port=8000)