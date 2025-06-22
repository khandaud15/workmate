import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const resumeId = url.searchParams.get('resumeId');

  if (!resumeId) {
    return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
  }

  try {
    // Fetch resume data from Firestore using Admin SDK in parsed_resumes/{email}/resumes/{resumeId}
    const resumeRef = db.collection('parsed_resumes').doc(session.user.email).collection('resumes').doc(resumeId);
    const resumeSnapshot = await resumeRef.get();
    
    if (!resumeSnapshot.exists) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const resumeData = resumeSnapshot.data();
    
    // Check if the user owns this resume
    if (!session?.user?.email || resumeData?.userId !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let parsedData = resumeData.parsedResumeData;
    
    if (typeof parsedData === 'string') {
      parsedData = JSON.parse(parsedData);
    }

    // Extract projects from parsed data
    let projects = [];
    
    // Check different possible locations for projects data
    if (parsedData.Projects) {
      projects = parsedData.Projects;
    } else if (parsedData.projects) {
      projects = parsedData.projects;
    } else if (parsedData['Project Experience']) {
      projects = parsedData['Project Experience'];
    }

    // Normalize project data structure
    const normalizedProjects = projects.map((project: any, index: number) => {
      // Handle different possible project data structures
      return {
        id: project.id || `project-${index}`,
        title: project.title || project.name || project.projectName || '',
        description: project.description || project.summary || '',
        technologies: project.technologies || project.tech || project.skills || [],
        url: project.url || project.link || project.website || '',
        startDate: project.startDate || project.start || '',
        endDate: project.endDate || project.end || '',
        bullets: Array.isArray(project.bullets) ? project.bullets : 
                Array.isArray(project.description) ? project.description : 
                typeof project.description === 'string' ? [project.description] : []
      };
    });

    return NextResponse.json(normalizedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
