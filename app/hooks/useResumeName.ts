import { useEffect, useState } from 'react';

/**
 * Custom hook to fetch the resume name by resumeId.
 * Falls back to localStorage or API if needed.
 */
export function useResumeName(resumeId: string) {
  const [resumeName, setResumeName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeId) return;
    setIsLoading(true);
    setError(null);
    // Try to get from localStorage first
    let found = false;
    try {
      const resumesRaw = localStorage.getItem('resumeList');
      if (resumesRaw) {
        const resumes = JSON.parse(resumesRaw);
        console.log('DEBUG useResumeName: Looking for resumeId:', resumeId);
        console.log('DEBUG useResumeName: Available resumes:', resumes);
        
        // Try to match by id, storageName, or numeric part of id
        const match = resumes.find((r: any) => {
          // Normalize IDs for comparison
          const normalizedResumeId = resumeId.match(/^\d+/)?.[0] || resumeId;
          const normalizedStorageName = r.storageName ? (r.storageName.match(/^\d+/)?.[0] || r.storageName) : '';
          const normalizedId = r.id ? (r.id.match(/^\d+/)?.[0] || r.id) : '';
          
          return r.id === resumeId || 
                 r.storageName === resumeId || 
                 normalizedId === normalizedResumeId || 
                 normalizedStorageName === normalizedResumeId;
        });
        
        if (match && match.name) {
          console.log('DEBUG useResumeName: Found match:', match);
          setResumeName(match.name);
          found = true;
        }
      }
    } catch (e) {}
    // Fallback: fetch from API
    if (!found) {
      fetch(`/api/resume/list?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          console.log('DEBUG useResumeName API: Looking for resumeId:', resumeId);
          console.log('DEBUG useResumeName API: Available resumes:', data.resumes);
          
          // Try to match by id, storageName, or numeric part of id
          const match = (data.resumes || []).find((r: any) => {
            // Normalize IDs for comparison
            const normalizedResumeId = resumeId.match(/^\d+/)?.[0] || resumeId;
            const normalizedStorageName = r.storageName ? (r.storageName.match(/^\d+/)?.[0] || r.storageName) : '';
            const normalizedId = r.id ? (r.id.match(/^\d+/)?.[0] || r.id) : '';
            
            return r.id === resumeId || 
                   r.storageName === resumeId || 
                   normalizedId === normalizedResumeId || 
                   normalizedStorageName === normalizedResumeId;
          });
          
          if (match && match.name) {
            console.log('DEBUG useResumeName API: Found match:', match);
            setResumeName(match.name);
          } else {
            console.log('DEBUG useResumeName API: No match found for', resumeId);
            setResumeName('Resume');
          }
        })
        .catch((e) => setError(e.message))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [resumeId]);

  return { resumeName, isLoading, error };
}
