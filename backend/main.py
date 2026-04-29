from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pdf_parser import extract_text_from_pdf
from matcher import calculate_match_score, get_missing_keywords, get_matched_keywords

app = FastAPI()

# CORS lets your React frontend (on a different port) talk to this backend
# without this, the browser blocks the request
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Resume Matcher API is running"}


@app.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),   # PDF file upload
    jd_text: str = Form(...)          # job description as plain text
):
    # read the uploaded PDF as bytes
    resume_bytes = await resume.read()

    # extract text from PDF
    resume_text = extract_text_from_pdf(resume_bytes)

    # run the matching logic
    score = calculate_match_score(resume_text, jd_text)
    missing = get_missing_keywords(resume_text, jd_text)
    matched = get_matched_keywords(resume_text, jd_text)

    return {
        "score": score,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "resume_text_preview": resume_text[:300]  # first 300 chars to confirm extraction worked
    }