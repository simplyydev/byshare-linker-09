
import { UserUploadHistory } from './types';
import { API_BASE_URL } from './apiConfig';

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

// Get user upload history from server with better error handling
export const getUserUploads = async (): Promise<UserUploadHistory[]> => {
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
