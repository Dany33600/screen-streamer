
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
    // Ensure the URL doesn't end with a slash to prevent double slashes in requests
    const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    // Ensure URL starts with http:// or https://
    let finalUrl = formattedUrl;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `http://${finalUrl}`;
    }
    
    setServerUrl(finalUrl);
    localStorage.setItem('serverUrl', finalUrl);
    console.log(`URL du serveur mise à jour: ${finalUrl}`);
  };
  
  return {
    serverUrl,
    updateServerUrl
  };
}
