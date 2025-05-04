
// Load settings from localStorage
export const loadSettings = (): {
  maxSizeMB: number;
  acceptedFileTypes: string[];
} => {
  const settings = localStorage.getItem('byshare_settings');
  if (settings) {
    return JSON.parse(settings);
  }
  // Default settings
  return {
    maxSizeMB: 100,
    acceptedFileTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'video/*',
      'audio/*'
    ]
  };
};

// Save settings to localStorage
export const saveSettings = (settings: {
  maxSizeMB: number;
  acceptedFileTypes: string[];
}): void => {
  localStorage.setItem('byshare_settings', JSON.stringify(settings));
};

// Verify admin credentials
export const verifyAdminCredentials = (username: string, password: string): boolean => {
  // In a real app, this would check against a securely stored credential
  // For demo purposes, we'll use hardcoded values (very insecure!)
  const storedCredentials = localStorage.getItem('byshare_admin_credentials');
  if (storedCredentials) {
    const creds = JSON.parse(storedCredentials);
    return creds.username === username && creds.password === password;
  }
  
  // Default admin credentials (these would normally be environment variables)
  return username === 'admin' && password === 'byshare2024';
};
