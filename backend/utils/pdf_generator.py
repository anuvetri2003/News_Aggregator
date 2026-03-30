from fpdf import FPDF  # type: ignore
from datetime import datetime
def clean_text(text):
    if not text:
        return ""
    replacements = {
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
        "–": "-",
        "—": "-",
        "…": "..."
    }
    for key, value in replacements.items():
        text = text.replace(key, value)
    return text.encode("latin-1", "ignore").decode("latin-1")
def generate_pdf(news):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    # Title
    pdf.set_font("Times", "B", 18)
    pdf.cell(0, 10, "Thuthan Renewable Energy News Report", ln=True, align="C")
    # Date
    pdf.set_font("Times", "", 11)
    today = datetime.now().strftime("%d %B %Y, %I:%M %p")
    pdf.cell(0, 8, f"Generated on: {today}", ln=True, align="C")
    pdf.ln(5)
    # Subtitle
    pdf.set_font("Times", "I", 12)
    pdf.cell(0, 10, "Latest 24 Hours News Summary", ln=True, align="C")
    pdf.ln(10)
    # News Content
    for i, item in enumerate(news, 1):
        title = clean_text(item['title'])
        summary = clean_text(item['summary'])
        category = clean_text(item['category'])
        source = clean_text(item['source'])
        link = item['link'] 
        # Title
        pdf.set_font("Times", "B", 12)
        pdf.multi_cell(0, 8, f"{i}. {title}")
        # Meta Info
        pdf.set_font("Times", "I", 10)
        pdf.multi_cell(0, 6, f"Category: {category} | Source: {source}")
        pdf.ln(1)
        # Summary
        pdf.set_font("Times", "", 11)
        pdf.multi_cell(0, 6, summary)
        pdf.ln(2)
        # Clickable Link 
        pdf.set_text_color(0, 0, 255)
        pdf.set_font("Times", "U", 10)
        pdf.cell(0, 6, "Read Full Article", link=link, ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(3)
        # Separator Line
        pdf.set_draw_color(200, 200, 200)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(6)
    # Save File
    file_path = "news.pdf"
    pdf.output(file_path)
    return file_path