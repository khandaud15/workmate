import os
import json
import openai
import fitz  # PyMuPDF
from google.cloud import storage

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
OPENAI_API_URL = os.environ.get('OPENAI_API_URL')
MODEL_NAME = os.environ.get('OPENAI_API_MODEL', 'gpt-4-1106-preview')
FIREBASE_BUCKET = os.environ.get('FIREBASE_BUCKET')

if OPENAI_API_URL:
    openai.api_base = OPENAI_API_URL

storage_client = storage.Client()
bucket = storage_client.bucket(FIREBASE_BUCKET)

def extract_text_from_firebase_pdf(firebase_path):
    blob = bucket.blob(firebase_path)
    pdf_bytes = blob.download_as_bytes()
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        text = "\n".join([page.get_text() for page in doc])
    return text

def parse_with_openai(text, model=MODEL_NAME):
    openai.api_key = OPENAI_API_KEY
    prompt = f"""
You are a resume parser. Extract the following structured data from the resume text below and return in JSON format:
- Full Name
- Email
- Phone
- LinkedIn (if any)
- Skills (list)
- Education (list with degree, institution, year)
- Work Experience (list with job title, company, start/end year, location, description)

Resume:
{text}
"""
    response = openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )
    return response.choices[0].message['content']

def save_parsed_to_firebase(json_data, dest_path):
    blob = bucket.blob(dest_path)
    blob.upload_from_string(json.dumps(json_data, indent=2), content_type='application/json')
    print(f'[✓] Parsed data uploaded to {dest_path}')

def parse_resume_from_firebase(firebase_path, dest_path):
    resume_text = extract_text_from_firebase_pdf(firebase_path)
    parsed = parse_with_openai(resume_text, model=MODEL_NAME)
    try:
        parsed_json = json.loads(parsed)
    except json.JSONDecodeError:
        print("[!] Failed to parse GPT output as JSON.")
        parsed_json = {"raw_output": parsed}
    save_parsed_to_firebase(parsed_json, dest_path)

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python parse_resume.py <firebase_pdf_path> <dest_json_path>")
        exit(1)
    parse_resume_from_firebase(sys.argv[1], sys.argv[2])
