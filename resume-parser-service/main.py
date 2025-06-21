import os
import json
import logging
from fastapi import FastAPI
from pydantic import BaseModel, Field
from google.cloud import storage
import fitz  # PyMuPDF
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_MODEL = os.getenv("OPENAI_API_MODEL", "gpt-3.5-turbo")
FIREBASE_BUCKET = os.getenv("FIREBASE_BUCKET")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Initialize Firebase storage client
storage_client = storage.Client()
bucket = storage_client.bucket(FIREBASE_BUCKET)


class BulletGenRequest(BaseModel):
    job_title: str = Field(..., min_length=1)
    company: str = ''
    existing_bullets: list[str] = []
    description: str = ''


class ResumeAnalysisRequest(BaseModel):
    resume_data: dict = Field(...)
    user_id: str = Field(default='')


@app.post('/generate-bullets')
async def generate_bullets(req: BulletGenRequest):
    if not req.description.strip() and not req.existing_bullets:
        return {"error": "Provide either a job description or existing bullets."}

    prompt = f"""
You are an expert resume writer.

Based on the following job title, company, job description, and existing bullet points, generate exactly 2 new resume bullet points that are:
- Professional
- Concise
- Relevant
- Do NOT repeat any of the existing bullets
- Start each new point with a strong action verb

Respond only with the 2 new bullet points, each starting with a dash (-).

Job Title: {req.job_title}
Company: {req.company}
Description: {req.description}
Existing Bullets:
""" + "\n".join(f"- {b}" for b in req.existing_bullets) + "\n\nNew Bullets:"

    try:
        logger.info(f"Request data - Title: {req.job_title}, Company: {req.company}")
        logger.info(f"Description length: {len(req.description)}, Existing bullets: {len(req.existing_bullets)}")
        logger.info(f"Full prompt:\n{prompt}")

        try:
            response = client.chat.completions.create(
                model=OPENAI_API_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=256,
                temperature=0.7,
                n=1
            )
            logger.info(f"Raw OpenAI response: {response}")
            text = response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
            logger.info(f"Extracted text from response: {text}")
        except (KeyError, IndexError) as e:
            logger.error(f"Error extracting content from response: {str(e)}")
            logger.error(f"Response structure: {response}")
            raise ValueError(f"Invalid response structure: {str(e)}")

        # Extract bullet points, handling different bullet formats
        new_bullets = []
        lines = text.split('\n')
        logger.info(f"Split into {len(lines)} lines")

        for line in lines:
            line = line.strip()
            if line and line.startswith(('-', '•', '*')):
                clean_line = line.lstrip('-•* ').strip()
                if clean_line:
                    new_bullets.append(clean_line)
                    logger.info(f"Added bullet: {clean_line}")

        # If no bullet-like lines found, try any non-empty lines
        if not new_bullets:
            logger.info("No bullet-prefixed lines found, trying any non-empty lines")
            new_bullets = [line.strip() for line in lines if line.strip()]

        # Ensure we have exactly 2 bullets
        new_bullets = new_bullets[:2]
        logger.info(f"Final bullets (count: {len(new_bullets)}): {new_bullets}")

        # Validate bullets
        if not new_bullets:
            raise ValueError("No valid bullets generated from response")

        return {"bullets": new_bullets}

    except Exception as e:
        logger.error(f"Error generating bullets: {str(e)}")
        return {"error": str(e)}


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
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=4000
        )

        content = response.choices[0].message.content
        logger.info(f"Successfully received response from OpenAI")
        return content
    except Exception as e:
        logger.error(f"Error parsing with OpenAI: {str(e)}")
        raise


def clean_json_response(text):
    if text.startswith('```'):
        first_line_end = text.find('\n')
        if first_line_end != -1:
            text = text[first_line_end + 1:]
        closing_marker = text.rfind('```')
        if closing_marker != -1:
            text = text[:closing_marker].strip()
    return text.strip()


@app.post('/analyze-resume')
async def analyze_resume(req: ResumeAnalysisRequest):
    try:
        logger.info(f"Analyzing resume for user: {req.user_id}")
        
        # Extract the resume data
        resume_data = req.resume_data
        
        # Create the analysis prompt
        analysis_prompt = f"""
You are an expert resume reviewer trained in technical, academic, and industry resume evaluation. 

Please analyze the resume below and return a structured evaluation across the following categories:

1. **Content (Score out of 100)**  
   - Assess relevance, completeness, and depth of information.  
   - Flag vague or passive bullet points.  
   - Check if achievements are measurable (quantified results, percentages, numbers, impact).  

2. **Format (Score out of 100)**  
   - Evaluate visual layout, bullet count per section, spacing, alignment, and punctuation consistency.  
   - Highlight missing periods, long sections, or inconsistent capitalization.  

3. **Optimization (Score out of 100)**  
   - Evaluate keyword usage relevant to the domain (e.g. tools, techniques, platforms, programming languages).  
   - Assess match to typical job descriptions in the candidate's field.  

4. **Best Practices (Score out of 100)**  
   - Check if the resume follows common resume writing standards:  
     - 3-6 bullet points per job  
     - Strong action verbs  
     - Clean structure  
     - Avoids unnecessary jargon or fluff  

5. **Application Readiness (Score out of 100)**  
   - A final evaluation that considers all of the above and answers:  
     "Is this resume ready to be submitted today for a competitive job?"

---

### Required Output:

1. A **table** summarizing each category with:
   - `score`
   - `status` (Excellent / Needs Improvement / Poor)
   - `short explanation`

2. A list of **specific issues found**, grouped by type:
   - Weak verbs
   - Lack of metrics
   - Bullet count problems
   - Formatting errors
   - Punctuation inconsistencies

3. A **brief summary** with:
   - Overall strengths
   - Areas for improvement
   - Estimated percentile ranking (e.g. "top 30% of technical resumes")

4. A final **Overall Score out of 100** based on the following weights:
   - Content: 30%
   - Format: 20%
   - Optimization: 20%
   - Best Practices: 20%
   - Application Readiness: 10%

---

Resume data to analyze:
{json.dumps(resume_data, indent=2)}
"""
        
        # Call OpenAI for analysis
        response = client.chat.completions.create(
            model=OPENAI_API_MODEL,
            messages=[{"role": "user", "content": analysis_prompt}],
            temperature=0.2,
            max_tokens=4000
        )
        
        # Extract and clean the response
        content = response.choices[0].message.content
        cleaned_content = clean_json_response(content)
        
        try:
            # Parse the JSON response
            analysis_result = json.loads(cleaned_content)
            logger.info(f"Successfully analyzed resume with overall score: {analysis_result.get('overallScore')}")
            return analysis_result
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            logger.error(f"Raw content: {cleaned_content}")
            return {"error": "Failed to parse analysis response"}
            
    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}")
        return {"error": str(e)}


@app.post('/parse-resume')
async def parse_resume(req: ParseRequest):
    try:
        logger.info(f"Received request to parse resume from: {req.firebase_pdf_path}")
        logger.info(f"Will save parsed JSON to: {req.parsed_json_path}")

        resume_text = extract_text_from_firebase_pdf(req.firebase_pdf_path)
        parsed = parse_with_openai(resume_text)
        logger.info(f"Raw response from OpenAI: {parsed[:100]}...")

        cleaned_parsed = clean_json_response(parsed)
        logger.info(f"Cleaned response: {cleaned_parsed[:100]}...")

        try:
            parsed_json = json.loads(cleaned_parsed)
            logger.info("Successfully parsed resume data to JSON")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            logger.error(f"Raw output: {parsed[:200]}...")
            return {
                "status": "error",
                "error": f"JSON decode error: {str(e)}",
                "raw_output": parsed[:500]
            }

        blob = bucket.blob(req.parsed_json_path)
        blob.upload_from_string(json.dumps(parsed_json, indent=2), content_type='application/json')

        logger.info(f"Successfully saved parsed resume to: {req.parsed_json_path}")
        return {"status": "success", "parsed_json_path": req.parsed_json_path}

    except Exception as e:
        logger.error(f"Error in parse_resume: {str(e)}")
        return {"status": "error", "error": str(e)}