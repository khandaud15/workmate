import os
import json
import logging
from fastapi import FastAPI
from pydantic import BaseModel
from google.cloud import storage
import fitz  # PyMuPDF
import openai
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Get environment variables
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
OPENAI_API_MODEL = os.environ.get('OPENAI_API_MODEL', 'gpt-4-1106-preview')
OPENAI_API_URL = os.environ.get('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions')
FIREBASE_BUCKET = os.environ.get('FIREBASE_BUCKET')

# Log environment variables (without sensitive info)
logger.info(f"Using model: {OPENAI_API_MODEL}")
logger.info(f"API URL: {OPENAI_API_URL}")
logger.info(f"Firebase bucket: {FIREBASE_BUCKET}")

# Initialize OpenAI client
client = OpenAI(
    api_key=OPENAI_API_KEY
    # Don't set base_url - let the client use the default
)

# Initialize Storage client
storage_client = storage.Client()
bucket = storage_client.bucket(FIREBASE_BUCKET)

class ParseRequest(BaseModel):
    firebase_pdf_path: str
    parsed_json_path: str

def extract_text_from_firebase_pdf(firebase_path):
    try:
        logger.info(f"Downloading PDF from: {firebase_path}")
        blob = bucket.blob(firebase_path)
        pdf_bytes = blob.download_as_bytes()
        
        logger.info(f"Extracting text from PDF")
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            text = "\n".join([page.get_text() for page in doc])
        
        logger.info(f"Successfully extracted {len(text)} characters from PDF")
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise

def parse_with_openai(text, model=OPENAI_API_MODEL):
    try:
        logger.info(f"Parsing resume with OpenAI model: {model}")
        
        prompt = f"""
You are a resume parser. Extract the following structured data from the resume text below and return in JSON format.
Do not include markdown formatting or code blocks. Return only the raw JSON object.

Extract these fields in a JSON object:
- Full Name
- Email
- Phone
- LinkedIn (if any)
- Address (full street address if present)
- City (city of residence)
- State (state/province of residence)
- Postal Code (ZIP/postal code)
- Skills (comprehensive list of all skills mentioned)
- Technical Skills (detailed breakdown of technical skills by category, if present)
- Education (list with degree, institution, year)
- Work Experience (list of objects with these properties):
  * Job Title
  * Company
  * Start/End Year
  * Location (if available)
  * Description (IMPORTANT: Include ALL bullet points and details for each position as an array of strings)

IMPORTANT: Pay special attention to the header/top section of the resume where contact information is typically located. Look for address information that may be formatted like "555 W Madison St. Apt-3303, Chicago, IL-60661" and extract the full address, city, state and postal code separately.

Be thorough and comprehensive. For work experience, capture ALL bullet points and responsibilities for each position, not just a summary. Don't truncate or summarize the descriptions.

Resume:
{text}
"""
        # Use the new OpenAI client API
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=4000  # Increase token limit to ensure complete response
        )
        
        content = response.choices[0].message.content
        logger.info(f"Successfully received response from OpenAI")
        return content
    except Exception as e:
        logger.error(f"Error parsing with OpenAI: {str(e)}")
        raise

def clean_json_response(text):
    """Clean the OpenAI response by removing markdown formatting."""
    # Remove markdown code block formatting if present
    if text.startswith('```'):
        # Find the end of the first line (which might contain ```json)
        first_line_end = text.find('\n')
        if first_line_end != -1:
            # Remove the first line
            text = text[first_line_end + 1:]
            
        # Find and remove the closing code block
        closing_marker = text.rfind('```')
        if closing_marker != -1:
            text = text[:closing_marker].strip()
    
    # Remove any leading/trailing whitespace
    return text.strip()

@app.post("/parse-resume")
async def parse_resume(req: ParseRequest):
    try:
        logger.info(f"Received request to parse resume from: {req.firebase_pdf_path}")
        logger.info(f"Will save parsed JSON to: {req.parsed_json_path}")
        
        # Extract text from PDF
        resume_text = extract_text_from_firebase_pdf(req.firebase_pdf_path)
        
        # Parse with OpenAI
        parsed = parse_with_openai(resume_text)
        logger.info(f"Raw response from OpenAI: {parsed[:100]}...")
        
        # Clean the response to remove any markdown formatting
        cleaned_parsed = clean_json_response(parsed)
        logger.info(f"Cleaned response: {cleaned_parsed[:100]}...")
        
        # Convert to JSON
        try:
            parsed_json = json.loads(cleaned_parsed)
            logger.info("Successfully parsed resume data to JSON")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            logger.error(f"Raw output: {parsed[:200]}...")
            return {
                "status": "error", 
                "error": f"JSON decode error: {str(e)}", 
                "raw_output": parsed[:500]  # Limit to first 500 chars
            }
        
        # Save to Firebase Storage
        logger.info(f"Saving parsed JSON to Firebase Storage")
        blob = bucket.blob(req.parsed_json_path)
        blob.upload_from_string(json.dumps(parsed_json, indent=2), content_type='application/json')
        
        logger.info(f"Successfully saved parsed resume to: {req.parsed_json_path}")
        return {"status": "success", "parsed_json_path": req.parsed_json_path}
    
    except Exception as e:
        logger.error(f"Error in parse_resume: {str(e)}")
        return {"status": "error", "error": str(e)}
