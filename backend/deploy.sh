#!/bin/bash

# SafeGuard AI Backend Deployment Script
# This script helps deploy the backend to various platforms

set -e

echo "🚀 SafeGuard AI Backend Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_status "Node.js version: $(node --version)"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "npm version: $(npm --version)"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm install
    print_status "Dependencies installed successfully!"
}

# Build the application
build_app() {
    print_status "Building application..."
    # For Node.js backend, no build step is needed
    print_status "Application ready for deployment!"
}

# Check environment file
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f env.template ]; then
            cp env.template .env
            print_warning "Please edit .env file with your configuration values"
            print_warning "Then run this script again"
            exit 1
        else
            print_error "env.template not found. Please create .env file manually"
            exit 1
        fi
    fi
    
    print_status "Environment file found"
}

# Local development setup
setup_local() {
    print_status "Setting up local development environment..."
    
    # Check if MongoDB is running
    if ! command -v mongod &> /dev/null; then
        print_error "MongoDB not found. Please install MongoDB locally or use a cloud MongoDB (e.g., Atlas). Docker support has been removed."
        exit 1
    else
        print_status "MongoDB found. Starting local development server..."
    fi
    
    print_status "Starting development server..."
    npm run dev
}

# Deploy to Render
deploy_render() {
    print_status "Deploying to Render..."
    
    if [ ! -f render.yaml ]; then
        print_error "render.yaml not found. Cannot deploy to Render"
        exit 1
    fi
    
    print_status "Please follow these steps to deploy to Render:"
    echo "1. Go to https://render.com"
    echo "2. Create a new account or sign in"
    echo "3. Click 'New +' and select 'Web Service'"
    echo "4. Connect your GitHub repository"
    echo "5. Render will automatically detect the render.yaml configuration"
    echo "6. Set your environment variables in the Render dashboard"
    echo "7. Deploy!"
    
    print_status "Deployment configuration ready!"
}

# Deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    print_status "Please follow these steps:"
    echo "1. Run: railway login"
    echo "2. Run: railway init"
    echo "3. Set your environment variables in Railway dashboard"
    echo "4. Run: railway up"
    
    print_status "Railway deployment ready!"
}

# Deploy to Heroku
deploy_heroku() {
    print_status "Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        print_status "Installing Heroku CLI..."
        # Instructions for installing Heroku CLI
        print_warning "Please install Heroku CLI from: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    print_status "Please follow these steps:"
    echo "1. Run: heroku login"
    echo "2. Run: heroku create your-app-name"
    echo "3. Set environment variables: heroku config:set KEY=value"
    echo "4. Run: git push heroku main"
    
    print_status "Heroku deployment ready!"
}

# Deploy to DigitalOcean App Platform
deploy_digitalocean() {
    print_status "Deploying to DigitalOcean App Platform..."
    
    print_status "Please follow these steps:"
    echo "1. Go to https://cloud.digitalocean.com/apps"
    echo "2. Click 'Create App'"
    echo "3. Connect your GitHub repository"
    echo "4. Configure build settings:"
    echo "   - Build Command: npm install"
    echo "   - Run Command: npm start"
    echo "5. Set environment variables"
    echo "6. Deploy!"
    
    print_status "DigitalOcean deployment ready!"
}

# Main deployment function
main() {
    case "${1:-local}" in
        "local")
            check_node
            check_npm
            install_deps
            check_env
            setup_local
            ;;
        "render")
            check_node
            check_npm
            install_deps
            deploy_render
            ;;
        "railway")
            check_node
            check_npm
            install_deps
            deploy_railway
            ;;
        "heroku")
            check_node
            check_npm
            install_deps
            deploy_heroku
            ;;
        "digitalocean")
            check_node
            check_npm
            install_deps
            deploy_digitalocean
            ;;
        # "docker")
        #     echo "Docker support removed"
        #     ;;
        *)
            echo "Usage: $0 {local|render|railway|heroku|digitalocean|docker}"
            echo ""
            echo "Deployment options:"
            echo "  local        - Local development setup"
            echo "  render       - Deploy to Render"
            echo "  railway      - Deploy to Railway"
            echo "  heroku       - Deploy to Heroku"
            echo "  digitalocean - Deploy to DigitalOcean App Platform"
            # echo "  docker       - Build Docker image"
            echo ""
            echo "Example: $0 local"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
