import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Resume parser service URL - will use direct OpenAI call as fallback
const PARSER_SERVICE_URL = process.env.RESUME_PARSER_SERVICE_URL || '';

export async function POST(req: Request) {
  console.log(">>>>> /api/resume-analyze POST handler was called - FULL LOGIC <<<<<");
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("Unauthorized access attempt to /api/resume-analyze");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log("User authenticated:", session.user.email);

    // Parse request body
    const { resumeId } = await req.json();
    if (!resumeId) {
      console.log("Resume ID missing in request to /api/resume-analyze");
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }
    console.log("Processing resumeId:", resumeId);

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log(`Using baseUrl: ${baseUrl} for internal API calls`);

    // Fetch resume data using the existing API endpoints
    console.log(`Fetching resume details from: ${baseUrl}/api/resume?resumeId=${resumeId}`);
    const resumeResponse = await fetch(`${baseUrl}/api/resume?resumeId=${resumeId}`);
    if (!resumeResponse.ok) {
      console.error(`Failed to fetch resume details for ${resumeId}, status: ${resumeResponse.status}`);
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    const resume = await resumeResponse.json();
    console.log("Successfully fetched resume details.");
    
    // Fetch work experiences
    console.log(`Fetching experiences from: ${baseUrl}/api/resume/experience?resumeId=${resumeId}`);
    const experiencesResponse = await fetch(`${baseUrl}/api/resume/experience?resumeId=${resumeId}`);
    const workExperiences = experiencesResponse.ok ? await experiencesResponse.json() : [];
    console.log(`Fetched ${workExperiences?.length || 0} work experiences.`);
    
    // Fetch education
    console.log(`Fetching education from: ${baseUrl}/api/resume/education?resumeId=${resumeId}`);
    const educationResponse = await fetch(`${baseUrl}/api/resume/education?resumeId=${resumeId}`);
    const educations = educationResponse.ok ? await educationResponse.json() : [];
    console.log(`Fetched ${educations?.length || 0} education entries.`);
    
    // Fetch skills
    console.log(`Fetching skills from: ${baseUrl}/api/resume/skills?resumeId=${resumeId}`);
    const skillsResponse = await fetch(`${baseUrl}/api/resume/skills?resumeId=${resumeId}`);
    const skills = skillsResponse.ok ? await skillsResponse.json() : [];
    console.log(`Fetched ${skills?.length || 0} skills.`);
    
    // Fetch projects
    console.log(`Fetching projects from: ${baseUrl}/api/resume/projects?resumeId=${resumeId}`);
    const projectsResponse = await fetch(`${baseUrl}/api/resume/projects?resumeId=${resumeId}`);
    const projects = projectsResponse.ok ? await projectsResponse.json() : [];
    console.log(`Fetched ${projects?.length || 0} projects.`);

    // Format resume data for GPT analysis
    const resumeData = {
      personalInfo: {
        name: resume.name,
        title: resume.title,
        summary: resume.summary,
      },
      workExperiences: workExperiences?.map((exp: any) => ({
        role: exp.role || exp['Job Title'],
        employer: exp.employer || exp.Company,
        location: exp.location,
        startDate: exp.startDate || exp['Start Date'],
        endDate: exp.endDate || exp['End Date'],
        description: exp.description,
        bullets: exp.bullets || [],
      })) || [],
      educations: educations?.map((edu: any) => ({
        institution: edu.institution || edu.School,
        degree: edu.degree,
        field: edu.field || edu['Field of Study'],
        startDate: edu.startDate || edu['Start Date'],
        endDate: edu.endDate || edu['End Date'],
        description: edu.description,
      })) || [],
      skills: skills?.map((skill: any) => ({
        name: skill.name || skill.Skill,
        level: skill.level || skill.Proficiency,
      })) || [],
      projects: projects?.map((project: any) => ({
        name: project.name || project.Title,
        description: project.description,
        url: project.url,
        startDate: project.startDate,
        endDate: project.endDate,
      })) || [],
    };
    console.log("Resume data formatted for analysis.");

    // Try to call the resume parser service if URL is provided
    if (PARSER_SERVICE_URL) {
      console.log(`Attempting to call resume parser service at: ${PARSER_SERVICE_URL}/analyze-resume`);
      try {
        const analyzeResponse = await fetch(`${PARSER_SERVICE_URL}/analyze-resume`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume_data: resumeData,
            user_id: session?.user?.email || 'unknown',
          }),
        });

        if (!analyzeResponse.ok) {
          const errorText = await analyzeResponse.text();
          console.error('Resume parser service error:', analyzeResponse.status, errorText);
          console.log("Falling back to direct OpenAI call due to parser service error.");
          // Fall through to direct OpenAI call
        } else {
          const analysisResult = await analyzeResponse.json();
          console.log("Successfully received analysis from resume parser service.");
          return NextResponse.json(analysisResult);
        }
      } catch (error) {
        console.error('Error calling resume parser service:', error);
        console.log("Falling back to direct OpenAI call due to exception during parser service call.");
        // Fall through to direct OpenAI call
      }
    }
    
    // Direct OpenAI call as fallback
    try {
      console.log('Using direct OpenAI call for resume analysis as fallback or primary.');
      
      const workExperienceText = (resumeData.workExperiences || []).map((exp: any, index: number) => {
        const bullets = exp.bullets?.map((bullet: string) => `- ${bullet}`).join('\n') || '';
        return `Experience ${index + 1}:\nRole: ${exp.role || 'Unknown'}\nEmployer: ${exp.employer || 'Unknown'}\nDuration: ${exp.startDate || ''} to ${exp.endDate || 'Present'}\n${bullets}\n`;
      }).join('\n');
      
      const skillsText = (resumeData.skills || []).map((skill: any) => skill.name).join(', ') || '';
      
      const analysisPrompt = `You are an expert resume reviewer with years of experience helping job seekers optimize their resumes. 

Analyze the following resume information, focusing especially on the work experience section:

===RESUME INFORMATION===
Name: ${resumeData.personalInfo?.name || 'Unknown'}
Title/Role: ${resumeData.personalInfo?.title || 'Unknown'}
Summary: ${resumeData.personalInfo?.summary || 'None provided'}

WORK EXPERIENCE:\n${workExperienceText}

SKILLS: ${skillsText}
===END RESUME===

Provide a detailed analysis with the following structure:
1. Calculate an overall score from 0-100 based on the quality of the resume
2. Break down scores by category (Content Quality, Format & Structure, ATS Optimization, Best Practices, Application Readiness)
3. Identify specific issues categorized as "error" (critical problems), "warning" (needs improvement), or "info" (suggestions)
4. Provide a summary of strengths and improvement areas

Return your analysis in the following JSON format without any additional text or explanation:

{
  "overallScore": number,
  "categories": [
    { "name": "Content Quality", "score": number, "color": string },
    { "name": "Format & Structure", "score": number, "color": string },
    { "name": "ATS Optimization", "score": number, "color": string },
    { "name": "Best Practices", "score": number, "color": string },
    { "name": "Application Readiness", "score": number, "color": string }
  ],
  "issues": [
    { 
      "type": "error" | "warning" | "info", 
      "message": "Brief issue description", 
      "detail": "Detailed explanation with advice",
      "relatedExperiences": ["Optional array of role names this issue relates to"]
    }
  ],
  "summary": "Overall assessment summary"
}`;
      
      console.log("Sending request to OpenAI API...");
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are an expert resume analyzer." },
          { role: "user", content: analysisPrompt }
        ],
        model: process.env.OPENAI_API_MODEL || "gpt-3.5-turbo",
        response_format: { type: "json_object" }
      });
      
      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        console.error('Empty response from OpenAI');
        throw new Error('Empty response from OpenAI');
      }
      console.log("Received response from OpenAI API.");
      
      const analysisResult = JSON.parse(responseContent);
      console.log("Successfully parsed OpenAI response.");
      return NextResponse.json(analysisResult);
    } catch (error) {
      console.error('Error with direct OpenAI analysis:', error);
      // Fallback error response if OpenAI fails
      return NextResponse.json({ 
        error: 'Failed to analyze resume using OpenAI',
        overallScore: 30, // Low default score on error
        categories: [
          { name: "Content Quality", score: 30, color: "#EF4444" },
          { name: "Format & Structure", score: 30, color: "#EF4444" },
          { name: "ATS Optimization", score: 30, color: "#EF4444" },
          { name: "Best Practices", score: 30, color: "#EF4444" },
          { name: "Application Readiness", score: 30, color: "#EF4444" }
        ],
        issues: [
          { 
            type: "error", 
            message: "Automated analysis failed", 
            detail: "We encountered an issue trying to analyze your resume with our AI. Please try again later or ensure your resume content is complete.",
          }
        ],
        summary: "Automated analysis could not be completed due to an internal error."
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unhandled error in /api/resume-analyze:', error);
    return NextResponse.json({ error: error.message || 'An unexpected server error occurred' }, { status: 500 });
  }
}
