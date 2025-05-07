import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription, parsedResume } = await req.json();

    const prompt = `As an expert career advisor, create a compelling cover letter based on the following information:

Resume Content:
${resumeText}

Job Description:
${jobDescription}

Candidate Information:
Name: ${parsedResume?.name || 'Not provided'}
Email: ${parsedResume?.email || 'Not provided'}
Phone: ${parsedResume?.phone || 'Not provided'}
Key Skills: ${parsedResume?.skills?.join(', ') || 'Not provided'}
Relevant Experience: ${parsedResume?.experience || 'Not provided'}

Instructions:
1. Match the candidate's experience and skills with the job requirements
2. Highlight specific achievements that align with the role
3. Use a professional yet engaging tone
4. Keep it concise and focused
5. Include a strong call to action
6. Format with proper business letter spacing and paragraphs
7. Extract the company name and position from the job description
8. Make the letter ATS-friendly

Format the letter professionally with proper spacing and paragraphs.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are an expert career advisor who writes compelling cover letters." },
                { role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ 
      coverLetter: completion.choices[0].message.content,
      status: 'success' 
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json({ 
      error: 'Failed to generate cover letter', 
      status: 'error' 
    }, { status: 500 });
  }
}
