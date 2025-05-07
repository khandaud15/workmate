import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();

    const prompt = `Extract the following information from this resume. Return it in JSON format:
    {
      "name": "full name",
      "email": "email address",
      "phone": "phone number",
      "skills": ["list of key skills"],
      "experience": "brief summary of relevant experience"
    }

    Resume:
    ${resumeText}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a resume parser that extracts key information accurately." },
                { role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const parsedInfo = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json({ status: 'success', data: parsedInfo });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return NextResponse.json({ 
      error: 'Failed to parse resume', 
      status: 'error' 
    }, { status: 500 });
  }
}
