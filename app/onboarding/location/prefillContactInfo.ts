      // Utility to fetch parsed resume data and extract contact information
export async function fetchContactInfoFromParsedResume(res: Response): Promise<{
  name: string;
  email: string;
  phone: string;
  location: string;
  resumeUrl: string;
} | null> {
  try {
    if (!res.ok) {
      console.error('Error fetching parsed resume:', res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    console.log('Parsed resume API response:', data);
    if (!data || !data.parsed_resume) {
      console.log('No parsed_resume data found in response');
      return null;
    }
    const parsed = data.parsed_resume;
    return {
      name: parsed.fullName || '',
      email: parsed.contactInfo?.email || '',
      phone: parsed.contactInfo?.phone || '',
      location: parsed.contactInfo?.location || '',
      resumeUrl: data.parsed_resume_url || '',
    };
  } catch (error) {
    console.error('Error in fetchContactInfoFromParsedResume:', error);
    return null;
  }
}
