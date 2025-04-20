
import { UserUploadHistory } from './types';
import { API_BASE_URL, IS_LOCAL_MODE } from './apiConfig';

// Helper function to generate a unique user ID
export const getUserId = (): string => {
  let userId = localStorage.getItem('byshare_user_id');
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    localStorage.setItem('byshare_user_id', userId);
  }
  return userId;
};

// Get user upload history from localStorage or server
export const getUserUploads = async (): Promise<UserUploadHistory[]> => {
  if (IS_LOCAL_MODE) {
    try {
      const userId = getUserId();
      const uploadsJson = localStorage.getItem(`byshare_uploads_${userId}`);
      return uploadsJson ? JSON.parse(uploadsJson) : [];
    } catch (error) {
      console.error('Error fetching user uploads from localStorage:', error);
      return [];
    }
  }
  
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/users/${userId}/uploads`);
    
    if (!response.ok) {
      // Vérifier si la réponse est HTML (ce qui indiquerait un problème avec le serveur)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('Server returned HTML instead of JSON. API may not be available.');
        return [];
      }
      
      throw new Error('Failed to fetch user uploads');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    // Retourner un tableau vide au lieu de planter
    return [];
  }
};

// Save user uploads to localStorage
export const saveUserUploads = (uploads: UserUploadHistory[]): void => {
  if (IS_LOCAL_MODE) {
    try {
      const userId = getUserId();
      localStorage.setItem(`byshare_uploads_${userId}`, JSON.stringify(uploads));
    } catch (error) {
      console.error('Error saving user uploads to localStorage:', error);
    }
  }
};

// Get upload count for today
export const getUploadCountForToday = (): number => {
  const userId = getUserId();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const uploadCountKey = `byshare_upload_count_${userId}_${today}`;
  const count = localStorage.getItem(uploadCountKey);
  
  return count ? parseInt(count) : 0;
};

// Increment upload count
export const incrementUploadCount = (): void => {
  const userId = getUserId();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const uploadCountKey = `byshare_upload_count_${userId}_${today}`;
  const currentCount = getUploadCountForToday();
  
  localStorage.setItem(uploadCountKey, (currentCount + 1).toString());
};

