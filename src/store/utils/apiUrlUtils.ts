
/**
 * Utility functions for API URL formatting and manipulation
 */

/**
 * Format an API URL to ensure it has the correct base and no trailing slashes
 * @param apiUrl The base API URL
 * @param ipToUse The IP address to use instead of localhost
 */
export const formatApiUrl = (apiUrl: string, ipToUse: string): string => {
  // Replace localhost with the specified IP address
  const formattedUrl = apiUrl.replace('localhost', ipToUse);
  
  // Remove trailing slashes
  return formattedUrl.endsWith('/') ? formattedUrl.slice(0, -1) : formattedUrl;
};

/**
 * Build a complete API URL from IP address and port
 * @param ipAddress IP address to use
 * @param port Port to use
 */
export const buildApiUrl = (ipAddress: string, port: number): string => {
  return `http://${ipAddress}:${port}/api`;
};

/**
 * Build a full URL for a specific API endpoint
 * @param baseUrl The base API URL
 * @param endpoint The API endpoint
 */
export const buildEndpointUrl = (baseUrl: string, endpoint: string): string => {
  const url = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${url}${cleanEndpoint}`;
};
