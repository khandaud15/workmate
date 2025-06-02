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
        const match = resumes.find((r: any) => r.id === resumeId || r.storageName === resumeId);
        if (match && match.name) {
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
          const match = (data.resumes || []).find((r: any) => r.id === resumeId || r.storageName === resumeId);
          if (match && match.name) {
            setResumeName(match.name);
          } else {
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
