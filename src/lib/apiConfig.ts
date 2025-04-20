
// Local mode configuration
export const IS_LOCAL_MODE = true;

// API base URL configuration
export const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // En développement, utilise le proxy Vite
  : '/api'; // En production, utilise le même chemin relatif

