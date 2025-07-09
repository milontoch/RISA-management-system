// Configuration file for the application
const config = {
  // API Configuration
  api: {
    // Development - Laravel backend
    baseURL: process.env.NODE_ENV === 'production' 
      ? 'https://risa-management-backend-production.up.railway.app/api'
      : 'http://localhost/RISA%20management%20system/backend-laravel/public/api',
  },
  
  // App Configuration
  app: {
    name: 'RISA Management System',
    version: '1.0.0',
  },
  
  // Feature flags
  features: {
    enableNotifications: true,
    enableFileUpload: true,
    enableBulkOperations: true,
  }
};

export default config; 