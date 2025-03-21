
import { useState, useEffect } from 'react';

export function useConfig() {
  const [serverUrl, setServerUrl] = useState<string>('');
  
  useEffect(() => {
    // Default to localhost if not in production
    const defaultUrl = 'http://localhost:5000';
    
    // Try to get server URL from localStorage
    const savedUrl = localStorage.getItem('serverUrl');
    
    if (savedUrl) {
      setServerUrl(savedUrl);
    } else {
      setServerUrl(defaultUrl);
      localStorage.setItem('serverUrl', defaultUrl);
    }
  }, []);
  
  const updateServerUrl = (url: string) => {
    setServerUrl(url);
    localStorage.setItem('serverUrl', url);
  };
  
  return {
    serverUrl,
    updateServerUrl
  };
}
