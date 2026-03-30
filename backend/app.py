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


@app.route("/download")
def download_pdf():
    news = fetch_news()
    news = normalize_news_list(news)

    file_path = generate_pdf(news)
    return send_file(file_path, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True, port=8000)