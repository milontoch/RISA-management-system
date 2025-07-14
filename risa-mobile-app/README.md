# RISA Management System - Mobile App

A React Native mobile application for the RISA Management System, built with Expo.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device

### Installation

1. **Install dependencies:**
```bash
cd risa-mobile-app
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Test on your device:**
- Download **Expo Go** from App Store (iOS) or Google Play Store (Android)
- Scan the QR code that appears in your terminal
- The app will load on your device

## 🔧 Configuration

### API Configuration
The app is configured to connect to your Laravel backend. Update the API URL in `src/config.js`:

```javascript
// For local development, use your computer's IP address
baseURL: __DEV__ 
  ? 'http://YOUR_IP_ADDRESS/RISA%20management%20system/backend-laravel/public/api'
  : 'https://risa-management-backend-production.up.railway.app/api'
```

### Finding Your IP Address
- **Windows:** Run `ipconfig` in CMD
- **Mac/Linux:** Run `ifconfig` in Terminal
- Look for your local IP (usually starts with 192.168.x.x)

## 📱 Features

### Touch Functionality
- ✅ Haptic feedback on button presses
- ✅ Smooth navigation between screens
- ✅ Touch-friendly interface
- ✅ Proper keyboard handling
- ✅ Loading states and error handling

### User Roles
- **Admin:** Full system access
- **Teacher:** Class and student management
- **Parent:** View child's information
- **Student:** View personal information

## 🔑 Test Credentials

Use these credentials to test different user roles:

### Admin
- Email: `admin@risa.edu`
- Password: `admin123`

### Teachers
- Email: `teacher@risa.edu` (Math Teacher - Class 1)
- Email: `teacher2@risa.edu` (Science Teacher - Class 2)
- Password: `teacher123`

### Parents
- Email: `parent@risa.edu` (Parent of Alex Johnson)
- Email: `parent2@risa.edu` (Parent of Emma Wilson)
- Password: `parent123`

### Students
- Email: `student1@risa.edu` (Alex Johnson - Class 1)
- Email: `student2@risa.edu` (Emma Wilson - Class 2)
- Password: `student123`

## 🛠 Development

### Available Scripts
- `npm start` - Start Expo development server
- `npm run android` - Start Android emulator
- `npm run ios` - Start iOS simulator (Mac only)
- `npm run web` - Start web version

### Project Structure
```
src/
├── screens/          # Screen components
├── services/         # API services
├── config.js         # App configuration
└── assets/           # Images and icons
```

## 🔌 Backend Connection

Make sure your Laravel backend is running and accessible:

1. **Start XAMPP:**
   - Start Apache and MySQL services
   - Ensure the backend is accessible at your configured URL

2. **Database:**
   - Run migrations: `php artisan migrate`
   - Seed test data: `php artisan db:seed --class=SimpleTestDataSeeder`

3. **API Endpoints:**
   - The app connects to Laravel API routes
   - All endpoints are protected with authentication
   - Token-based authentication using Laravel Sanctum

## 🐛 Troubleshooting

### Common Issues

1. **"Network request failed"**
   - Check if your Laravel backend is running
   - Verify the API URL in `src/config.js`
   - Ensure your device and computer are on the same network

2. **"Cannot connect to development server"**
   - Make sure Expo CLI is installed: `npm install -g @expo/cli`
   - Try restarting the development server
   - Check your firewall settings

3. **"API request failed"**
   - Verify the backend API routes are working
   - Check the Laravel logs for errors
   - Ensure the database is properly seeded

### Debug Mode
Enable debug logging by checking the console output in your terminal when running the app.

## 📱 Testing

### Physical Device
1. Install Expo Go app
2. Scan QR code from terminal
3. Test all user roles and features

### Emulator/Simulator
- **Android:** Press `a` in terminal
- **iOS:** Press `i` in terminal (Mac only)
- **Web:** Press `w` in terminal

## 🚀 Deployment

### Production Build
```bash
expo build:android  # For Android
expo build:ios      # For iOS
```

### App Store Deployment
1. Configure app.json with your app details
2. Build production version
3. Submit to App Store/Google Play

## 📄 License

This project is part of the RISA Management System.

## 🤝 Support

For support and questions:
- Check the troubleshooting section
- Review the Laravel backend documentation
- Ensure all prerequisites are installed 