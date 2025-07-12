// Configuration file for the React Native application
const config = {
  // API Configuration
  api: {
    // Development - Laravel backend
    baseURL: __DEV__ 
      ? 'http://localhost/RISA%20management%20system/backend-laravel/public/api'
      : 'https://risa-management-backend-production.up.railway.app/api',
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