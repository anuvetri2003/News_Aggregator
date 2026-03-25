from flask import Flask, render_template, send_file 
from utils.fetch_news import fetch_news
from utils.pdf_generator import generate_pdf

app = Flask(__name__)

@app.route("/")
def home():
    news = fetch_news()

    featured_news = news[0] if news else None
    remaining_news = news[1:] if len(news) > 1 else []

    categories_count = {
        "All": len(news),
        "Companies & Products": len([n for n in news if n["category"] == "Companies & Products"]),
        "Government & Tariff": len([n for n in news if n["category"] == "Government & Tariff"]),
        "International News": len([n for n in news if n["category"] == "International News"]),
        "Others": len([n for n in news if n["category"] == "Others"]),
    }

    return render_template(
        "index.html",
        featured_news=featured_news,
        news=remaining_news,
        total_articles=len(news),
        categories_count=categories_count
    )

@app.route("/download")
def download_pdf():
    news = fetch_news()
    file_path = generate_pdf(news)
    return send_file(file_path, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)