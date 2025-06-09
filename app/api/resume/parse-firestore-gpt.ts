import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function parseResumeWithGPT(resumeText: string) {
  const prompt = `Extract the following fields from this resume and return as JSON. Pay special attention to the header/contact section for accurate contact details.\n\nRequired fields:\n- fullName\n- email\n- phone\n- address (extract the complete street address exactly as written in the resume)\n- city (extract from address or location info)\n- state (extract from address or location info)\n- zipCode (or postal code for international addresses)\n- country (extract from address or location info)\n- linkedinUrl (if present)\n- personalWebsite (if present)\n- workExperience (array of { jobTitle, company, startDate, endDate, responsibilities })\n\nIMPORTANT: Only extract information that is explicitly present in the resume. If any field (such as address, city, state, postal code, or country) is missing or unclear, leave it blank. Do NOT use any example, default, or made-up values. Do NOT use '555 W Madison' or any other example address.\n\nResume:\n${resumeText}\n`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that extracts structured data from resumes.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 1200
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No content returned from GPT');
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error('Failed to parse GPT output as JSON: ' + content);
  }
}
