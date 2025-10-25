#!/bin/bash

# CivicAgent Frontend Setup Script
# This script helps set up the CivicAgent frontend application

set -e  # Exit on any error

echo "============================================"
echo "  CivicAgent Frontend Setup"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js LTS from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Node.js detected: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✓ npm detected: $NPM_VERSION"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found"
    echo "Creating .env.local from template..."
    
    cat > .env.local << EOF
# Supabase Configuration
# Replace these with your actual Supabase project credentials

# Get these from: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF
    
    echo "✓ .env.local created from template"
    echo ""
    echo "⚠️  IMPORTANT: You need to update .env.local with your Supabase credentials"
    echo "   1. Go to https://supabase.com and create a project"
    echo "   2. Get your Project URL and anon key from Settings > API"
    echo "   3. Update the values in .env.local"
    echo ""
else
    echo "✓ .env.local file found"
    
    # Check if credentials are still placeholders
    if grep -q "your-project.supabase.co" .env.local; then
        echo "⚠️  Warning: .env.local contains placeholder values"
        echo "   Please update with your actual Supabase credentials"
        echo ""
    else
        echo "✓ Supabase credentials appear to be configured"
    fi
fi

# Summary
echo "============================================"
echo "  Setup Complete! 🎉"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Supabase (if not done):"
echo "   - Update .env.local with your Supabase credentials"
echo "   - Run the SQL in database_schema.sql in Supabase SQL Editor"
echo "   - Set up the storage bucket 'complaint-images'"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "For detailed instructions, see:"
echo "   - README.md (comprehensive documentation)"
echo "   - QUICKSTART.md (step-by-step guide)"
echo ""
echo "Happy coding! 🚀"
