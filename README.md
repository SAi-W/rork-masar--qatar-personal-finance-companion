# Masar: Qatar Personal Finance Companion

A native iOS and Android mobile application for personal finance management, built with Expo and React Native.

## 🚀 Features

- **Secure Authentication**: Email/password login with secure token storage
- **Multi-language Support**: English and Arabic with RTL support
- **Financial Management**: Track expenses, income, accounts, and subscriptions
- **Smart Insights**: AI-powered financial coaching and recommendations
- **Receipt Management**: OCR-powered receipt scanning and expense tracking
- **Native Experience**: Optimized for iOS and Android with platform-specific features

## 📱 Platforms

- **iOS**: 13.0+ (iPhone and iPad)
- **Android**: 8.0+ (API level 26+)

## 🛠 Tech Stack

- **Frontend**: React Native, Expo SDK 53
- **Navigation**: Expo Router v5
- **State Management**: Zustand, React Query
- **Backend**: tRPC, Hono, Prisma
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with secure storage
- **UI Components**: Custom components with native styling

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Expo CLI
- EAS CLI (for builds)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SAi-W/rork-masar--qatar-personal-finance-companion.git
   cd rork-masar--qatar-personal-finance-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

5. **Login to Expo**
   ```bash
   eas login
   ```

### Development

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Run on iOS Simulator**
   ```bash
   npm run start:ios
   ```

3. **Run on Android Emulator**
   ```bash
   npm run start:android
   ```

4. **Start with development client**
   ```bash
   npm run start:dev
   ```

### Backend Development

1. **Start the backend server**
   ```bash
   npm run dev:api
   ```

2. **Run database migrations**
   ```bash
   npm run migrate
   ```

3. **Generate Prisma client**
   ```bash
   npm run generate
   ```

## 🏗 Building for Production

### iOS Build

1. **Build for iOS**
   ```bash
   npm run build:ios
   ```

2. **Preview build**
   ```bash
   npm run preview:ios
   ```

3. **Submit to App Store**
   ```bash
   npm run submit:ios
   ```

### Android Build

1. **Build for Android**
   ```bash
   npm run build:android
   ```

2. **Preview build**
   ```bash
   npm run preview:android
   ```

3. **Submit to Google Play**
   ```bash
   npm run submit:android
   ```

## 🔧 Configuration

### App Configuration

- **app.config.ts**: Main app configuration
- **eas.json**: EAS build configuration
- **app.json**: Expo configuration (legacy)

### Environment Variables

- `EXPO_PUBLIC_API_URL`: Backend API URL
- `EXPO_PUBLIC_ENV`: Environment (development/staging/production)
- `EAS_PROJECT_ID`: EAS project identifier

## 📱 Native Features

- **Secure Storage**: Sensitive data stored in iOS Keychain/Android Keystore
- **Push Notifications**: Native notification handling
- **Biometric Authentication**: Face ID/Touch ID support
- **Background Tasks**: Data synchronization in background
- **Deep Linking**: Custom URL scheme handling
- **Platform-specific UI**: Native look and feel for each platform

## 🔐 Security Features

- **Secure Storage**: Authentication tokens and user data encrypted
- **Biometric Auth**: Face ID/Touch ID integration
- **JWT Tokens**: Secure authentication with refresh tokens
- **Data Encryption**: Sensitive data encrypted at rest

## 🌐 Internationalization

- **Languages**: English and Arabic
- **RTL Support**: Right-to-left layout for Arabic
- **Localization**: Currency formatting, date formats, and text

## 📊 Database Schema

The app uses Prisma with PostgreSQL for data persistence:

- **Users**: Authentication and profile data
- **Accounts**: Bank accounts and balances
- **Expenses**: Transaction tracking
- **Subscriptions**: Recurring payments
- **Receipts**: Document storage and OCR data

## 🚀 Deployment

### Backend

The backend is deployed on Render.com with automatic deployments from the main branch.

### Mobile Apps

- **iOS**: App Store Connect with EAS builds
- **Android**: Google Play Console with EAS builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both platforms
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

- **Expo SDK**: Regularly updated to latest stable version
- **Dependencies**: Security updates and bug fixes
- **Platform Support**: Latest iOS and Android versions
