#!/bin/bash

# Masar Native Build Script
# This script helps build the app for iOS and Android

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if EAS CLI is installed
check_eas() {
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI is not installed. Please install it first:"
        echo "npm install -g @expo/eas-cli"
        exit 1
    fi
    print_success "EAS CLI found"
}

# Check if logged in to Expo
check_login() {
    if ! eas whoami &> /dev/null; then
        print_error "Not logged in to Expo. Please login first:"
        echo "eas login"
        exit 1
    fi
    print_success "Logged in to Expo"
}

# Build for iOS
build_ios() {
    local profile=${1:-production}
    print_status "Building for iOS with profile: $profile"
    
    eas build --platform ios --profile $profile
    
    if [ $? -eq 0 ]; then
        print_success "iOS build completed successfully!"
    else
        print_error "iOS build failed!"
        exit 1
    fi
}

# Build for Android
build_android() {
    local profile=${1:-production}
    print_status "Building for Android with profile: $profile"
    
    eas build --platform android --profile $profile
    
    if [ $? -eq 0 ]; then
        print_success "Android build completed successfully!"
    else
        print_error "Android build failed!"
        exit 1
    fi
}

# Build for both platforms
build_all() {
    local profile=${1:-production}
    print_status "Building for both platforms with profile: $profile"
    
    eas build --platform all --profile $profile
    
    if [ $? -eq 0 ]; then
        print_success "All platform builds completed successfully!"
    else
        print_error "Build failed!"
        exit 1
    fi
}

# Submit to stores
submit_ios() {
    print_status "Submitting iOS build to App Store Connect..."
    eas submit --platform ios
}

submit_android() {
    print_status "Submitting Android build to Google Play Console..."
    eas submit --platform android
}

# Show help
show_help() {
    echo "Masar Native Build Script"
    echo ""
    echo "Usage: $0 [COMMAND] [PROFILE]"
    echo ""
    echo "Commands:"
    echo "  ios [profile]     Build for iOS (default profile: production)"
    echo "  android [profile] Build for Android (default profile: production)"
    echo "  all [profile]     Build for both platforms (default profile: production)"
    echo "  submit-ios        Submit iOS build to App Store Connect"
    echo "  submit-android    Submit Android build to Google Play Console"
    echo "  help              Show this help message"
    echo ""
    echo "Profiles:"
    echo "  development       Development build with development client"
    echo "  preview          Preview build for testing"
    echo "  production       Production build for app stores"
    echo ""
    echo "Examples:"
    echo "  $0 ios production"
    echo "  $0 android preview"
    echo "  $0 all development"
}

# Main script logic
main() {
    print_status "Starting Masar native build process..."
    
    # Check prerequisites
    check_eas
    check_login
    
    case "$1" in
        "ios")
            build_ios "$2"
            ;;
        "android")
            build_android "$2"
            ;;
        "all")
            build_all "$2"
            ;;
        "submit-ios")
            submit_ios
            ;;
        "submit-android")
            submit_android
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
