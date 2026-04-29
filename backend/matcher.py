import re
from sentence_transformers import SentenceTransformer, util
import spacy

nlp = spacy.load("en_core_web_sm")

# load once when server starts — this is a pretrained model that understands meaning
# "all-MiniLM-L6-v2" is small (80MB), fast, and accurate enough for this use case
model = SentenceTransformer("all-MiniLM-L6-v2")

JUNK_WORDS = {
    "strong", "ability", "complex", "high", "industry", "robust", "utilize",
    "standard", "responsible", "key", "core", "end", "track", "record",
    "concepts", "foundation", "foundational", "ideal", "role", "junior",
    "senior", "experience", "background", "knowledge", "good", "great",
    "excellent", "understand", "understanding", "work", "working", "team",
    "fast", "environment", "multiple", "various", "including", "related",
    "relevant", "required", "requirement", "preferred", "plus", "bonus",
    "etc", "e", "g", "vs", "using", "used", "use", "build", "building",
    "built", "develop", "developing", "developed", "design", "designing",
    "implement", "implementing", "proficiency", "mastery", "service",
    "solution", "systems", "platform", "feature", "version", "object",
    "testing", "learn", "degree", "bachelor", "pursue", "completed",
    "currently", "proven", "specific", "real", "time", "architecture",
    "structure", "structures", "analytic", "need", "seek", "looking",
    "help", "maintain", "join", "opportunity", "position", "candidate",
    "applicant", "company", "familiarity", "fresher", "developer",
    "engineer", "basic", "apis"
}

TECH_SKILLS = {
    "python", "javascript", "typescript", "react", "nodejs", "node",
    "express", "mongodb", "mysql", "postgresql", "postgres", "html", "css",
    "git", "github", "docker", "aws", "flask", "fastapi", "django",
    "xgboost", "sklearn", "scikitlearn", "scikit", "pandas", "numpy",
    "jwt", "rest", "api", "sql", "nosql", "redux", "graphql", "php",
    "cpp", "java", "nextjs", "next", "tailwind", "bootstrap",
    "machine", "learning", "tensorflow", "pytorch", "nlp",
    "postman", "vscode", "linux", "firebase", "redis",
    "authentication", "crud", "dashboard", "pipeline", "model",
    "classification", "detection", "intrusion", "fullstack",
    "mern", "mean", "stack", "isolation", "forest", "decision", "tree"
}


def preprocess_text(text: str) -> str:
    text = re.sub(r'\s*\|\s*', ' ', text)
    text = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', text)
    text = re.sub(r'(?<=[A-Z])(?=[A-Z][a-z])', ' ', text)
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219\-\*•⚫]', ' ', text)
    text = re.sub(r'(?<=[a-zA-Z])[\.\-](?=[a-zA-Z])', '', text)
    text = re.sub(r'\(.*?\)', ' ', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()


def extract_keywords(text: str) -> set:
    text = preprocess_text(text)
    doc = nlp(text)
    keywords = set()
    for token in doc:
        if token.is_stop or token.is_punct or len(token.text) < 2:
            continue
        lemma = token.lemma_.lower().strip()
        if lemma in JUNK_WORDS or len(lemma) < 2:
            continue
        keywords.add(lemma)
    return keywords


def calculate_match_score(resume_text: str, jd_text: str) -> float:
    clean_resume = preprocess_text(resume_text)
    clean_jd = preprocess_text(jd_text)

    # semantic similarity — compares meaning not just words
    # encode() converts text into a vector of 384 numbers that represent meaning
    # cosine_similarity then measures how close those vectors are
    resume_embedding = model.encode(clean_resume, convert_to_tensor=True)
    jd_embedding = model.encode(clean_jd, convert_to_tensor=True)
    semantic_score = float(util.pytorch_cos_sim(resume_embedding, jd_embedding)[0][0])

    # keyword overlap — direct tech skill matching
    resume_keywords = extract_keywords(resume_text)
    jd_keywords = extract_keywords(jd_text)

    if not jd_keywords:
        return 0.0

    matched = resume_keywords & jd_keywords
    keyword_score = len(matched) / len(jd_keywords)

    # tech skill bonus
    tech_in_jd = jd_keywords & TECH_SKILLS
    tech_matched = resume_keywords & tech_in_jd
    tech_score = (len(tech_matched) / len(tech_in_jd)) if tech_in_jd else 0.0

    # final: 50% semantic + 30% keyword overlap + 20% tech skills
    # semantic carries the most weight now since it understands meaning
    final = (semantic_score * 0.5) + (keyword_score * 0.3) + (tech_score * 0.2)

    return round(min(final * 100, 99.0), 2)


def get_missing_keywords(resume_text: str, jd_text: str) -> list:
    resume_keywords = extract_keywords(resume_text)
    jd_keywords = extract_keywords(jd_text)
    missing = jd_keywords - resume_keywords
    return sorted(list(missing))


def get_matched_keywords(resume_text: str, jd_text: str) -> list:
    resume_keywords = extract_keywords(resume_text)
    jd_keywords = extract_keywords(jd_text)
    matched = jd_keywords & resume_keywords
    return sorted(list(matched))