def categorize_news(title, summary=""):
    text = f"{title} {summary}".lower()

    government_keywords = [
        "policy", "tariff", "subsidy", "government", "ministry",
        "tender", "auction", "regulation", "scheme", "approval"
    ]

    company_keywords = [
        "company", "startup", "product", "launch",
        "investment", "funding", "business", "partnership"
    ]

    international_keywords = [
        "usa", "china", "uk", "europe", "germany",
        "france", "canada", "australia", "japan"
    ]

    for keyword in government_keywords:
        if keyword in text:
            return "Government & Tariff"

    for keyword in company_keywords:
        if keyword in text:
            return "Companies & Products"

    for keyword in international_keywords:
        if keyword in text:
            return "International News"

    return "Others"