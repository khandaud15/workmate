import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function parseResumeWithGPT(resumeText: string) {
  const prompt = `Extract the following fields from this resume and return as JSON:\n- fullName\n- email\n- phone\n- location\n- workExperience (array of { jobTitle, company, startDate, endDate, responsibilities })\nResume:\n${resumeText}\n`;

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
