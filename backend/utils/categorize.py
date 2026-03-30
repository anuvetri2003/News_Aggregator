def categorize_news(title, summary=""):
    text = f"{title} {summary}".lower()
    government_keywords = [
        "policy", "tariff", "subsidy", "government", "ministry",
        "tender", "auction", "regulation", "scheme", "approval",
        "mnre", "discom", "ppa", "power purchase", "cabinet",
        "mandate", "target", "clearance", "guidelines", "rules",
        "rule", "draft", "notified", "regulator", "commission",
        "ministry of power", "energy department", "budget", "incentive"
    ]
    company_keywords = [
        "company", "startup", "product", "launch",
        "investment", "funding", "business", "partnership",
        "manufacturer", "acquisition", "shares", "mou",
        "deploys", "secures", "wins", "signs", "signed",
        "factory", "plant", "project", "joint venture",
        "expansion", "contract", "agreement", "stake",
        "raises", "revenue", "profit", "developer"
    ]
    international_keywords = [
        "global", "international", "eu", "europe", "uk", "usa",
        "china", "germany", "france", "canada", "australia",
        "japan", "vietnam", "morocco", "thailand", "indonesia",
        "spain", "italy", "brazil", "africa", "middle east",
        "singapore", "malaysia", "south korea", "netherlands",
        "scotland", "nova scotia", "uruguay", "quebec"
    ]
    for keyword in government_keywords:
        if keyword in text:
            return "Government & Tariff"
    for keyword in company_keywords:
        if keyword in text:
            return "Companies & Products"
    for keyword in international_keywords:
        if keyword in text:
            return "International"
    return "Others"