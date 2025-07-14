// Configuration file for the React Native application
const config = {
  // API Configuration
  api: {
    // Development - Laravel backend server
    baseURL: __DEV__ 
      ? 'http://localhost:8000/api'  // Laravel development server
      : 'https://risa-management-backend-production.up.railway.app/api',
    
    // Alternative configurations for different setups:
    // For Android emulator: 'http://10.0.2.2:8000/api'
    // For physical device on same network: 'http://YOUR_IP_ADDRESS:8000/api'
    // For ngrok: 'https://your-ngrok-url.ngrok.io/api'
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