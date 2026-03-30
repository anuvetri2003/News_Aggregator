from flask import Flask, render_template, send_file, request  # type: ignore
from utils.fetch_news import fetch_news
from utils.pdf_generator import generate_pdf
app = Flask(__name__)
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
@app.route("/")
def home():
    news = fetch_news()
    news = normalize_news_list(news)
    featured_news = news[0] if len(news) > 0 else None
    side_news = news[1:3] if len(news) > 1 else []
    bottom_news = news[3:5] if len(news) > 3 else []
    return render_template(
        "index.html",
        featured_news=featured_news,
        side_news=side_news,
        bottom_news=bottom_news
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
@app.route("/download")
def download_pdf():
    news = fetch_news()
    news = normalize_news_list(news)
    file_path = generate_pdf(news)
    return send_file(file_path, as_attachment=True)
if __name__ == "__main__":
    app.run(debug=True, port = 8000)