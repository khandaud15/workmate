import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import OpenAI from 'openai';
import { db } from '@/lib/firebase';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_API_MODEL || 'gpt-3.5-turbo-16k';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email;

    // Parse request body
    const body = await request.json();
    const { jobDescription, position, companyName, resumeId } = body;

    // Validate required fields
    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }
    if (!position) {
      return NextResponse.json({ error: 'Position is required' }, { status: 400 });
    }
    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }
    
    console.log(`[COVER-LETTER-GENERATE API] Starting cover letter generation:`, {
      userEmail,
      resumeId,
      position,
      companyName
    });
    
    let parsedResumeData = null;
    
    try {
      // Get the specific resume document
      const resumesRef = db.collection('parsed_resumes').doc(userEmail).collection('resumes');
      console.log(`[COVER-LETTER-GENERATE API] Looking for resume with ID: ${resumeId}`);
      
      // Extract timestamp from filename if present (this is the actual document ID in Firestore)
      const timestampMatch = resumeId.match(/^(\d+)/);
      const timestamp = timestampMatch ? timestampMatch[1] : null;
      
      console.log(`[COVER-LETTER-GENERATE API] Extracted timestamp from resumeId: ${timestamp || 'none'} (from ${resumeId})`);
      
      // First try to get the resume directly by the timestamp (which is the document ID in Firestore)
      let resumeDoc;
      if (timestamp) {
        console.log(`[COVER-LETTER-GENERATE API] Trying to find resume by timestamp ID: ${timestamp}`);
        resumeDoc = await resumesRef.doc(timestamp).get();
        if (resumeDoc.exists) {
          console.log(`[COVER-LETTER-GENERATE API] Found resume by timestamp ID: ${timestamp}`);
        }
      }
      
      // If not found by timestamp, try the full ID
      if (!resumeDoc || !resumeDoc.exists) {
        console.log(`[COVER-LETTER-GENERATE API] Trying to find resume by full ID: ${resumeId}`);
        resumeDoc = await resumesRef.doc(resumeId).get();
      }
      
      // This section is now handled above in the initial timestamp check
      
      // If still not found, try to find by any field containing the resumeId
      if (!resumeDoc || !resumeDoc.exists) {
        console.log(`[COVER-LETTER-GENERATE API] Trying to find resume by field matching: ${resumeId}`);
        // Try to find any document that has this filename in any field
        const allResumes = await resumesRef.get();
        
        for (const doc of allResumes.docs) {
          const data = doc.data();
          const fields = ['name', 'originalFileName', 'fullFileName', 'storageName'];
          
          for (const field of fields) {
            if (data[field] && (
                data[field] === resumeId || 
                data[field].includes(resumeId)
              )) {
              console.log(`[COVER-LETTER-GENERATE API] Found resume by ${field} match: ${data[field]}`);
              resumeDoc = doc;
              break;
            }
          }
          
          if (resumeDoc && resumeDoc.exists) break;
        }
      }
      
      // If still not found, try to find by storage name fields
      if (!resumeDoc.exists) {
        console.log(`[COVER-LETTER-GENERATE API] Resume not found by direct ID, trying by fields...`);
        
        // Try various field lookups
        const fieldQueries = [
          { field: 'fullFileName', value: resumeId },
          { field: 'originalFileName', value: resumeId },
          { field: 'storageName', value: resumeId },
          { field: 'name', value: resumeId }
        ];
        
        for (const query of fieldQueries) {
          console.log(`[COVER-LETTER-GENERATE API] Trying to find by ${query.field}: ${query.value}`);
          const queryResult = await resumesRef
            .where(query.field, '==', query.value)
            .limit(1)
            .get();
            
          if (!queryResult.empty) {
            resumeDoc = queryResult.docs[0];
            console.log(`[COVER-LETTER-GENERATE API] Found resume by ${query.field}: ${query.value}`);
            break;
          }
        }
      }
      
      // If still not found, list all resumes and return error
      if (!resumeDoc.exists) {
        console.log(`[COVER-LETTER-GENERATE API] Resume not found with ID or storage name: ${resumeId}, checking all resumes...`);
        
        // List all resumes with complete data to help debug
        const allResumes = await resumesRef.get();
        console.log('[COVER-LETTER-GENERATE API] Available resumes:', 
          allResumes.docs.map(doc => {
            const data = doc.data() || {};
            return {
              id: doc.id,
              status: data.status,
              originalFileName: data.originalFileName,
              fullFileName: data.fullFileName,
              storageName: data.storageName,
              name: data.name,
              // List all fields to help identify what we can match on
              allFields: Object.keys(data).filter(key => 
                typeof data[key] === 'string' && 
                !key.includes('parsed') && 
                !key.includes('content')
              ).reduce<Record<string, string>>((obj, key) => {
                obj[key] = data[key] as string;
                return obj;
              }, {}),
              hasParsedData: !!data.parsedResumeData
            };
          }));
        
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }

      const data = resumeDoc.data();
      console.log(`[COVER-LETTER-GENERATE API] Found resume document:`, {
        id: resumeId,
        status: data?.status,
        hasParsedData: !!data?.parsedResumeData
      });
      
      if (!data?.parsedResumeData || data.status !== 'parsed') {
        console.log(`[COVER-LETTER-GENERATE API] Resume ${resumeId} has no parsed data`);
        return NextResponse.json({ error: 'Selected resume has no parsed data' }, { status: 400 });
      }

      parsedResumeData = data.parsedResumeData;
      
      // Log the actual structure of the parsed resume data
      console.log(`[COVER-LETTER-GENERATE API] Raw parsed resume data structure:`, 
        JSON.stringify(parsedResumeData).substring(0, 200) + '...');
      console.log(`[COVER-LETTER-GENERATE API] Successfully retrieved parsed resume data:`, {
        id: resumeId,
        dataFields: Object.keys(parsedResumeData)
      });
      
      if (!parsedResumeData) {
        console.log(`[COVER-LETTER-GENERATE API] No parsed resume data found in any resume`);
        return NextResponse.json({ error: 'No parsed resume data found for user' }, { status: 404 });
      }
    } catch (error) {
      console.error('[COVER-LETTER-GENERATE API] Error fetching resume data:', error);
      return NextResponse.json({ error: 'Error fetching resume data' }, { status: 500 });
    }
    
    // Log more detailed structure to understand the data
    console.log('[COVER-LETTER-GENERATE API] Resume data structure:');
    if (parsedResumeData?.parsedData) {
      console.log('- Has parsedData:', typeof parsedResumeData.parsedData, 
        Object.keys(parsedResumeData.parsedData || {}));
    }
    if (parsedResumeData?.resumeData) {
      console.log('- Has resumeData:', typeof parsedResumeData.resumeData, 
        Object.keys(parsedResumeData.resumeData || {}));
    }
    if (parsedResumeData?.resumeText) {
      console.log('- Has resumeText:', typeof parsedResumeData.resumeText, 
        parsedResumeData.resumeText?.substring(0, 100) + '...');
    }
    
    // Get the user document for name information
    const userDoc = await db.collection('users').doc(userEmail).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    // Extract candidate name from user data - use full name
    let candidateName = userData?.name || userData?.displayName || "Candidate";
    // Keep the full name, don't split it

    // Create a structured representation of the resume data for the GPT API
    let resumeText = '';
    
    // Extract name from the parsed resume data if available
    if (parsedResumeData && parsedResumeData['Full Name']) {
      resumeText += `Name: ${parsedResumeData['Full Name']}\n`;
    } else {
      resumeText += `Name: ${candidateName || 'Not specified'}\n`;
    }
    
    console.log('[COVER-LETTER-GENERATE API] Extracting data from parsed resume structure');
    
    // Add contact information if available
    let contactInfo = [];
    if (parsedResumeData['Email']) contactInfo.push(parsedResumeData['Email']);
    if (parsedResumeData['Phone']) contactInfo.push(parsedResumeData['Phone']);
    if (parsedResumeData['LinkedIn']) contactInfo.push(parsedResumeData['LinkedIn']);
    
    // Add location information if available
    let location = [];
    if (parsedResumeData['City']) location.push(parsedResumeData['City']);
    if (parsedResumeData['State']) location.push(parsedResumeData['State']);
    if (parsedResumeData['Postal Code']) location.push(parsedResumeData['Postal Code']);
    
    if (contactInfo.length > 0 || location.length > 0) {
      resumeText += `Contact: ${contactInfo.join(' | ')}\n`;
      if (location.length > 0) {
        resumeText += `Location: ${location.join(', ')}\n`;
      }
      resumeText += '\n';
    }
    
    // Add education if available
    if (parsedResumeData['Education'] && Array.isArray(parsedResumeData['Education'])) {
      resumeText += 'EDUCATION:\n';
      parsedResumeData['Education'].forEach((edu: any) => {
        resumeText += `- ${edu.Degree || ''} ${edu.Institution ? 'from ' + edu.Institution : ''}\n`;
        if (edu.Year) {
          resumeText += `  ${edu.Year}\n`;
        }
      });
      resumeText += '\n';
    }
    
    // Add work experience if available
    if (parsedResumeData['Work Experience'] && Array.isArray(parsedResumeData['Work Experience'])) {
      resumeText += 'WORK EXPERIENCE:\n';
      parsedResumeData['Work Experience'].forEach((exp: any) => {
        resumeText += `- ${exp['Job Title'] || 'Position'} at ${exp['Company'] || 'Company'}\n`;
        if (exp['Start/End Year']) {
          resumeText += `  ${exp['Start/End Year']}\n`;
        }
        if (exp['Location']) {
          resumeText += `  ${exp['Location']}\n`;
        }
        if (exp['Description'] && Array.isArray(exp['Description'])) {
          exp['Description'].forEach((bullet: string) => {
            resumeText += `  • ${bullet}\n`;
          });
        }
      });
      resumeText += '\n';
    }
    
    // Add skills if available
    if (parsedResumeData['Skills'] && Array.isArray(parsedResumeData['Skills'])) {
      resumeText += `SKILLS: ${parsedResumeData['Skills'].join(', ')}\n\n`;
    } else if (parsedResumeData['Technical Skills']) {
      // Handle nested technical skills
      const technicalSkills = parsedResumeData['Technical Skills'];
      const allSkills: string[] = [];
      
      // Extract skills from each category
      Object.keys(technicalSkills).forEach(category => {
        if (Array.isArray(technicalSkills[category])) {
          allSkills.push(...technicalSkills[category]);
        }
      });
      
      if (allSkills.length > 0) {
        resumeText += `SKILLS: ${allSkills.join(', ')}\n\n`;
      }
    }
    
    console.log('[COVER-LETTER-GENERATE API] Generated resume text:', resumeText);

    // Create the prompt for OpenAI
    const prompt = `
RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Position: ${position}
Company: ${companyName}

IMPORTANT: Format the cover letter with the applicant's contact information at the top as follows:
${parsedResumeData['Full Name'] || candidateName}
${location.join(', ')}
${contactInfo.join(' | ')}

Then start with "Dear Hiring Manager," and continue with the cover letter content.
`;

    console.log('[COVER-LETTER-GENERATE API] Sending request to OpenAI');
    
    // Call OpenAI API using the same configuration as the resume parser
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL || 'gpt-3.5-turbo-16k', // Use the model from env var
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional cover letter writer. Follow these rules STRICTLY:\n1. ONLY use information explicitly stated in the provided resume\n2. NEVER make up or infer experience, skills, or qualifications\n3. If you cannot find relevant experience in the resume for a job requirement, DO NOT MENTION that requirement\n4. Do not use generic phrases like "I am passionate about" unless specifically mentioned in the resume\n5. Keep the tone professional but natural\n6. Focus on MATCHING the actual experience and skills from the resume to the job requirements\n7. IMPORTANT: DO NOT include date, company address, or recipient address sections in the cover letter\n8. Format the cover letter EXACTLY like this:\n   [Full Name]\n   [Location]\n   [Email]\n   [Phone]\n\n   Dear Hiring Manager,\n\n   [Cover letter content...]\n9. You MUST include the applicant\'s full contact details at the top exactly as shown above'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1, // Lower temperature for more factual output
      max_tokens: 1200 // Same as resume parser
    });

    // Extract the generated cover letter
    const coverLetter = response.choices[0]?.message?.content;
    if (!coverLetter) {
      throw new Error('No content returned from OpenAI');
    }

    console.log('[COVER-LETTER-GENERATE API] Successfully generated cover letter');

    // Prepare contact information for the response
    const responseContactInfo = {
      phone: parsedResumeData['Phone'] || '',
      email: parsedResumeData['Email'] || '',
      linkedin: parsedResumeData['LinkedIn'] || '',
      location: location.join(', ') || ''
    };

    console.log('[COVER-LETTER-GENERATE API] Returning contact info:', responseContactInfo);

    // Return the generated cover letter with contact information
    return NextResponse.json({ 
      coverLetter,
      isAIGenerated: true,
      candidateName: parsedResumeData['Full Name'] || candidateName,
      contactInfo: responseContactInfo
    });
  } catch (error: any) {
    console.error('[COVER-LETTER-GENERATE API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate cover letter',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
