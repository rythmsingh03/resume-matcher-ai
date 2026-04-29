import pdfplumber
import re
from io import BytesIO


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            # extract words individually with their positions
            words = page.extract_words(x_tolerance=3, y_tolerance=3)
            if words:
                # join words with space — prevents line-end concatenation
                page_text = " ".join(w["text"] for w in words)
                text += page_text + "\n"
    return text.strip()


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()