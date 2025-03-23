
import config from './config';

// Maximum uploads per day per IP
export const MAX_UPLOADS_PER_DAY = config.get('app.maxUploadsPerDay');

// Admin credentials - Note: In a production environment, use environment variables
export const ADMIN_CREDENTIALS = config.get('app.adminCredentials');
