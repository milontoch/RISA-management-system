// Configuration file for the application
const config = {
  // API Configuration
  api: {
    // Development - Laravel backend
    baseURL: 'http://localhost/RISA%20management%20system/backend-laravel/public/api',
    
    // Production - Update this when deploying
    // baseURL: 'https://your-domain.com/api',
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