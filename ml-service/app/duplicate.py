from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def detect_duplicates(projects):
    """
    Uses TF-IDF + Cosine Similarity to compare project titles and descriptions
    to identify duplicate or suspiciously similar sanctioned works.
    """
    texts = []
    for p in projects:
        title = p.get("work", "")
        desc = p.get("description", "")
        category = p.get("category", "")
        combined = f"{title} {category} {desc}".strip()
        texts.append(combined if combined else "project work")

    if len(texts) < 2:
        return [{"possibleDuplicate": False, "similarity": 0.0, "matchedProjectId": None} for _ in projects]

    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(texts)
        sim_matrix = cosine_similarity(tfidf_matrix)

        results = []
        for i, p in enumerate(projects):
            max_sim = 0.0
            match_id = None
            for j in range(len(projects)):
                if i != j:
                    sim = float(sim_matrix[i, j])
                    if sim > max_sim:
                        max_sim = sim
                        match_id = projects[j].get("id")

            is_dup = bool(max_sim >= 0.50 or p.get("dupSignal", 0) > 60)
            results.append({
                "possibleDuplicate": is_dup,
                "similarity": round(max_sim, 2),
                "matchedProjectId": match_id if is_dup else None
            })
        return results
    except Exception as e:
        print(f"[Duplicate Detection Warning]: {e}")
        return [{"possibleDuplicate": False, "similarity": 0.0, "matchedProjectId": None} for _ in projects]
