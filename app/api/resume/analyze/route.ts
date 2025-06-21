import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import OpenAI from 'openai';
import { db } from '@/lib/firebase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Helper function to determine color based on score
 */
function getColorForScore(score: number): string {
  if (score < 40) return '#F44336'; // Red
  if (score < 70) return '#FFA726'; // Orange/Yellow
  return '#4CAF50'; // Green
}

/**
 * Resume analysis API endpoint that uses OpenAI to analyze resume content
 * This provides a detailed score and feedback for resumes
 */
export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the resume ID from the request body
    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    console.log(`Processing resume analysis for resumeId: ${resumeId}`);

    // Fetch resume data from the database
    console.log(`Fetching resume data for resumeId: ${resumeId}`);
    
    let resume: any;
    
    try {
      // Get the resume document from Firestore using Admin SDK - using the same path as experience API
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'User email not found in session' }, { status: 400 });
      }
      
      console.log(`Looking for resume in parsed_resumes/${session.user.email}/resumes/${resumeId}`);
      const resumeRef = db.collection('parsed_resumes').doc(session.user.email).collection('resumes').doc(resumeId);
      const resumeSnapshot = await resumeRef.get();
      
      if (resumeSnapshot.exists) {
        // Get the actual resume data
        const resumeData = resumeSnapshot.data() as any;
        
        // Extract parsed resume data - this is where the actual content is
        let parsedData = resumeData.parsedResumeData || {};
        
        // Handle case where parsedResumeData is a string
        if (typeof parsedData === 'string') {
          try {
            parsedData = JSON.parse(parsedData);
          } catch (e) {
            console.error('Failed to parse parsedResumeData string:', e);
            parsedData = {}; // Reset if parsing fails
          }
        }
        
        console.log('DEBUG: Parsed resume data structure:', Object.keys(parsedData));
        
        // Construct the resume object from parsed data
        resume = {
          id: resumeId,
          ...resumeData,
          parsedData: parsedData
        };
        
        // Extract experiences from the parsed data
        const workExperience = parsedData['Work Experience'] || parsedData.work_experience || [];
        if (Array.isArray(workExperience) && workExperience.length > 0) {
          resume.experiences = workExperience;
          console.log(`Found ${workExperience.length} experiences in parsed resume data`);
        } else {
          console.log('No experiences found in parsed resume data');
          resume.experiences = [];
        }
      } else {
        console.log(`Resume ${resumeId} not found in database`);
        
        // Let's check if there's a resume with a similar ID (e.g., if the ID format is different)
        try {
          // List all resumes to see what's available
          const resumesRef = db.collection('parsed_resumes').doc(session.user.email).collection('resumes');
          const allResumesSnapshot = await resumesRef.limit(10).get();
          
          console.log(`Available resumes in database for user ${session.user.email}:`);
          allResumesSnapshot.forEach(doc => {
            console.log(`- Resume ID: ${doc.id}`);
          });
          
          // Check if the resumeId might be a numeric prefix of an actual ID
          if (resumeId.match(/^\d+$/)) {
            // Try to find a resume with a matching prefix or numeric ID
            const numericId = resumeId;
            const prefixQuery = db.collection('parsed_resumes')
              .doc(session.user.email)
              .collection('resumes')
              .where('storageName', '>=', numericId)
              .where('storageName', '<=', numericId + '\uf8ff')
              .limit(1);
              
            const prefixResults = await prefixQuery.get();
            
            if (!prefixResults.empty) {
              const prefixMatch = prefixResults.docs[0];
              console.log(`Found resume with matching prefix: ${prefixMatch.id}`);
              
              // Use this resume instead
              const matchResumeRef = db.collection('parsed_resumes')
                .doc(session.user.email)
                .collection('resumes')
                .doc(prefixMatch.id);
                
              const matchResumeSnapshot = await matchResumeRef.get();
              
              if (matchResumeSnapshot.exists) {
                // Get the actual resume data
                const resumeData = matchResumeSnapshot.data() as any;
                
                // Extract parsed resume data - this is where the actual content is
                let parsedData = resumeData.parsedResumeData || {};
                
                // Handle case where parsedResumeData is a string
                if (typeof parsedData === 'string') {
                  try {
                    parsedData = JSON.parse(parsedData);
                  } catch (e) {
                    console.error('Failed to parse parsedResumeData string:', e);
                    parsedData = {}; // Reset if parsing fails
                  }
                }
                
                // Construct the resume object from parsed data
                resume = {
                  id: prefixMatch.id,
                  ...resumeData,
                  parsedData: parsedData
                };
                
                // Extract experiences from the parsed data
                const workExperience = parsedData['Work Experience'] || parsedData.work_experience || [];
                if (Array.isArray(workExperience) && workExperience.length > 0) {
                  resume.experiences = workExperience;
                  console.log(`Found ${workExperience.length} experiences in parsed resume data`);
                } else {
                  console.log('No experiences found in parsed resume data');
                  resume.experiences = [];
                }
              }
            } else {
              console.log(`No resume found with prefix: ${numericId}`);
              return NextResponse.json({ error: 'Resume not found in database' }, { status: 404 });
            }
          } else {
            return NextResponse.json({ error: 'Resume not found in database' }, { status: 404 });
          }
        } catch (listError) {
          console.error('Error listing available resumes:', listError);
          return NextResponse.json({ error: 'Resume not found in database' }, { status: 404 });
        }
      }
    } catch (error) {
      console.error('Error fetching resume data:', error);
      return NextResponse.json({ error: 'Error fetching resume data' }, { status: 500 });
    }

    // Prepare resume data for analysis
    const resumeData = {
      ...resume,
      userId: session.user?.email || 'unknown'
    };

    // Analyze resume using OpenAI
    console.log(`Sending resume data to OpenAI for analysis with ${resumeData.experiences?.length || 0} experiences`);
    const analysis = await analyzeResumeWithOpenAI(resumeData, resumeId);
    
    console.log(`Analysis complete. Overall score: ${analysis.overallScore}`);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in resume analysis:', error);
    // Return a basic fallback analysis if analysis fails
    return NextResponse.json({
      overallScore: 50,
      summary: "Basic resume analysis (analysis failed)",
      categories: [
        { name: "Content", score: 50, color: "#FFA726" },
        { name: "Format", score: 50, color: "#FFA726" },
        { name: "Optimization", score: 50, color: "#FFA726" },
        { name: "Best Practices", score: 50, color: "#FFA726" },
        { name: "Application Ready", score: 50, color: "#FFA726" }
      ],
      issues: [
        { 
          type: "info", 
          message: "Analysis service is currently unavailable", 
          detail: "We're experiencing technical difficulties with our analysis service. Please try again later.",
          relatedExperiences: []
        }
      ]
    });
  }
}

/**
 * Analyzes resume data using OpenAI
 * @param resumeData The resume data to analyze
 * @param resumeId The ID of the resume
 * @returns Analysis result with scores and feedback
 */
async function analyzeResumeWithOpenAI(resumeData: any, resumeId: string) {
  try {
    console.log('Analyzing resume with OpenAI...');
    
    // Check if resume data exists
    if (!resumeData) {
      throw new Error('No resume data provided');
    }
    
    // Format the resume data for the OpenAI prompt using the parsed resume structure
    const formattedExperiences = resumeData.experiences?.map((exp: any) => {
      // Extract bullet points from various possible fields
      const bullets = Array.isArray(exp.Description) ? exp.Description : 
                    Array.isArray(exp.bulletPoints) ? exp.bulletPoints : 
                    Array.isArray(exp.bullets) ? exp.bullets : [];
      
      // Extract role and company from various possible fields
      const role = exp.role || exp.Role || exp.Position || exp.Title || 'Unknown';
      const employer = exp.employer || exp.Employer || exp.Company || exp['Company Name'] || 'Unknown';
      
      // Extract dates from various possible fields
      const startDate = exp.startDate || exp['Start Date'] || exp['Start/End Year']?.split('-')[0]?.trim() || 'Unknown';
      const endDate = exp.endDate || exp['End Date'] || 
                    (exp['Start/End Year']?.toLowerCase().includes('present') ? 'Present' : 
                     exp['Start/End Year']?.split('-')[1]?.trim()) || 'Present';
      
      // Extract location
      const location = exp.location || exp.Location || 'Unknown';
      
      return `Role: ${role}
Employer: ${employer}
Duration: ${startDate} to ${endDate}
Location: ${location}
Bullet Points:
${bullets.map((bullet: string) => `- ${bullet}`).join('\n') || 'None provided'}`;
    }).join('\n\n') || 'No experiences provided';
    
    // Get education from parsed data
    let educationData = [];
    if (resumeData.parsedData && resumeData.parsedData.Education) {
      educationData = resumeData.parsedData.Education || [];
    } else if (resumeData.education) {
      educationData = resumeData.education;
    }
    
    const formattedEducation = Array.isArray(educationData) ? educationData.map((edu: any) => {
      // Extract fields from various possible formats
      const degree = edu.degree || edu.Degree || edu['Degree/Major'] || 'Unknown';
      const institution = edu.institution || edu.Institution || edu.School || edu['School Name'] || edu.University || 'Unknown';
      const startDate = edu.startDate || edu['Start Date'] || (edu['Year'] && edu['Year'].split('-')[0]) || 'Unknown';
      const endDate = edu.endDate || edu['End Date'] || 
                   (edu['Year'] && (edu['Year'].toLowerCase().includes('present') ? 'Present' : edu['Year'].split('-')[1])) || 'Unknown';
      const location = edu.location || edu.Location || 'Unknown';
      const description = edu.description || edu.Description || 'None provided';
      
      return `Degree: ${degree}
Institution: ${institution}
Duration: ${startDate} to ${endDate}
Location: ${location}
Description: ${description}`;
    }).join('\n\n') : 'No education provided';
    
    // Get skills from parsed data
    let skillsData = [];
    if (resumeData.parsedData && resumeData.parsedData.Skills) {
      skillsData = resumeData.parsedData.Skills || [];
    } else if (resumeData.skills) {
      skillsData = resumeData.skills;
    }
    
    const formattedSkills = Array.isArray(skillsData) ? skillsData.join(', ') : 
                          typeof skillsData === 'string' ? skillsData : 'No skills provided';
    
    // Get projects from parsed data
    let projectsData = [];
    if (resumeData.parsedData && resumeData.parsedData.Projects) {
      projectsData = resumeData.parsedData.Projects || [];
    } else if (resumeData.projects) {
      projectsData = resumeData.projects;
    }
    
    const formattedProjects = Array.isArray(projectsData) ? projectsData.map((proj: any) => {
      // Extract fields from various possible formats
      const name = proj.name || proj.Name || proj.Title || proj.Project || 'Unknown';
      const description = proj.description || proj.Description || 'None provided';
      const url = proj.url || proj.URL || proj.Link || 'None provided';
      
      return `Name: ${name}
Description: ${description}
URL: ${url}`;
    }).join('\n\n') : 'No projects provided';
    
    // Construct the prompt for OpenAI
    const prompt = `You are an expert resume analyst and career coach. Please analyze the following resume and provide detailed feedback and scoring.

RESUME CONTENT:

===== EXPERIENCES =====
${formattedExperiences}

===== EDUCATION =====
${formattedEducation}

===== SKILLS =====
${formattedSkills}

===== PROJECTS =====
${formattedProjects}

Based on this resume, please provide a comprehensive analysis with the following components:

1. Overall Score (0-100)
2. Summary (2-3 sentences about the resume's strengths and areas for improvement)
3. Category Scores (0-100 for each):
   - Content: Quality of experiences, bullet points, and achievements
   - Format: Structure, organization, and readability
   - Optimization: Keyword usage and ATS compatibility
   - Best Practices: Following resume standards and conventions
   - Application Ready: Overall readiness for job applications
4. Issues (at least 2-3 specific issues with the resume):
   - Each issue should have a type (warning, error, or info)
   - A brief message describing the issue
   - A detailed explanation with advice for improvement
   - Related experiences that demonstrate this issue (if applicable)

Please format your response as a JSON object with the following structure:
{
  "overallScore": number,
  "summary": "string",
  "categories": [
    { "name": "Content", "score": number },
    { "name": "Format", "score": number },
    { "name": "Optimization", "score": number },
    { "name": "Best Practices", "score": number },
    { "name": "Application Ready", "score": number }
  ],
  "issues": [
    {
      "type": "warning|error|info",
      "message": "string",
      "detail": "string",
      "relatedExperiences": ["string"]
    }
  ]
}`;

    // Log the resume data being sent to OpenAI
    console.log(`Resume ID: ${resumeId} - Sending data to OpenAI for analysis`);
    console.log(`Resume has ${resumeData.experiences?.length || 0} experiences`);
    console.log(`Resume has ${resumeData.education?.length || 0} education entries`);
    console.log(`Resume has ${resumeData.skills?.length || 0} skills`);
    
    // Call OpenAI API with appropriate settings for resume analysis
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL || 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert resume analyst and career coach. Provide honest, detailed feedback based on the resume content. Be critical and thorough in your assessment. Each resume should be evaluated on its own merits with unique scores that reflect its specific content.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7, // Higher temperature for more varied responses
      max_tokens: 2000
    });
    
    console.log('OpenAI response received for resume:', resumeId);
    
    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('No content in OpenAI response for resume:', resumeId);
      throw new Error('No content in OpenAI response');
    }
    
    console.log('Response content sample:', content.substring(0, 100) + '...');
    
    // Extract JSON from the response
    let jsonMatch = content.match(/\{[\s\S]*\}/); 
    if (!jsonMatch) {
      console.error('Could not extract JSON from OpenAI response for resume:', resumeId);
      console.error('Raw content:', content);
      throw new Error('Could not extract JSON from OpenAI response');
    }
    
    try {
      const analysisResult = JSON.parse(jsonMatch[0]);
      
      // Log the scores to verify they're dynamic
      console.log(`Resume ${resumeId} analysis scores:`);
      console.log(`Overall score: ${analysisResult.overallScore}`);
      analysisResult.categories.forEach((cat: any) => {
        console.log(`${cat.name}: ${cat.score}`);
      });
      
      // Add color to each category based on score
      const categoriesWithColor = analysisResult.categories.map((category: any) => ({
        ...category,
        color: getColorForScore(category.score)
      }));
      
      return {
        ...analysisResult,
        categories: categoriesWithColor
      };
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI response:', parseError);
      console.error('JSON content that failed to parse:', jsonMatch[0].substring(0, 200) + '...');
      throw parseError;
    }
  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    
    // Return a basic error message and try again
    console.log('Retrying OpenAI analysis with simplified prompt...');
    
    try {
      // Try a simpler prompt as fallback
      const simplePrompt = `Analyze this resume and provide scores (0-100) for different aspects:

Experiences: ${resumeData.experiences?.map((e: any) => `${e.role} at ${e.employer}`).join(', ')}

Education: ${resumeData.education?.map((e: any) => `${e.degree} from ${e.institution}`).join(', ')}

Skills: ${resumeData.skills?.join(', ')}`;
      
      const fallbackResponse = await openai.chat.completions.create({
        model: process.env.OPENAI_API_MODEL || 'gpt-4o',
        messages: [{ role: 'user', content: simplePrompt }],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const fallbackContent = fallbackResponse.choices[0]?.message?.content;
      if (fallbackContent) {
        // Try to extract scores from the text response
        const contentMatch = fallbackContent.match(/content:?\s*(\d+)/i);
        const formatMatch = fallbackContent.match(/format:?\s*(\d+)/i);
        const optimizationMatch = fallbackContent.match(/optimi[zs]ation:?\s*(\d+)/i);
        const practicesMatch = fallbackContent.match(/practices:?\s*(\d+)/i);
        const readyMatch = fallbackContent.match(/ready:?\s*(\d+)/i);
        const overallMatch = fallbackContent.match(/overall:?\s*(\d+)/i);
        
        const contentScore = contentMatch ? parseInt(contentMatch[1]) : 65;
        const formatScore = formatMatch ? parseInt(formatMatch[1]) : 65;
        const optimizationScore = optimizationMatch ? parseInt(optimizationMatch[1]) : 65;
        const bestPracticesScore = practicesMatch ? parseInt(practicesMatch[1]) : 65;
        const applicationReadyScore = readyMatch ? parseInt(readyMatch[1]) : 65;
        const overallScore = overallMatch ? parseInt(overallMatch[1]) : 65;
        
        return {
          overallScore,
          summary: fallbackContent.split('\n')[0] || "Your resume has been analyzed with a simplified approach due to technical issues.",
          categories: [
            { name: "Content", score: contentScore, color: getColorForScore(contentScore) },
            { name: "Format", score: formatScore, color: getColorForScore(formatScore) },
            { name: "Optimization", score: optimizationScore, color: getColorForScore(optimizationScore) },
            { name: "Best Practices", score: bestPracticesScore, color: getColorForScore(bestPracticesScore) },
            { name: "Application Ready", score: applicationReadyScore, color: getColorForScore(applicationReadyScore) }
          ],
          issues: [
            { 
              type: "info", 
              message: "Simplified analysis provided", 
              detail: "We've provided a simplified analysis due to technical issues with our detailed analysis system.",
              relatedExperiences: []
            }
          ]
        };
      }
    } catch (fallbackError) {
      console.error('Fallback analysis also failed:', fallbackError);
    }
    
    // If all else fails, return a very basic response
    return {
      overallScore: 65,
      summary: "We encountered an issue analyzing your resume. Please try again later.",
      categories: [
        { name: "Content", score: 65, color: getColorForScore(65) },
        { name: "Format", score: 65, color: getColorForScore(65) },
        { name: "Optimization", score: 65, color: getColorForScore(65) },
        { name: "Best Practices", score: 65, color: getColorForScore(65) },
        { name: "Application Ready", score: 65, color: getColorForScore(65) }
      ],
      issues: [
        { 
          type: "info", 
          message: "Analysis service temporarily unavailable", 
          detail: "We're currently experiencing technical difficulties with our analysis service. Please try again later.",
          relatedExperiences: []
        }
      ]
    };
  }
}
