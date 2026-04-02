#!/bin/bash
# TaskFlow - Quick Start Script
# Run this to get the project up and running

echo "🚀 TaskFlow - Task Management System"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd server 2>/dev/null || { echo "❌ Cannot find server directory"; exit 1; }

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install > /dev/null 2>&1
    echo "   ✅ Backend dependencies installed"
else
    echo "   ✅ Backend dependencies already installed"
fi

echo ""
echo "📋 Backend Configuration:"
echo "   .env file required with:"
echo "   - MONGODB_URI=your_connection_string"
echo "   - JWT_SECRET=your_secret_key"
echo "   - PORT=5000"
echo ""

# Return to root
cd ..

# Setup Frontend
echo "📦 Setting up Frontend..."
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install > /dev/null 2>&1
    echo "   ✅ Frontend dependencies installed"
else
    echo "   ✅ Frontend dependencies already installed"
fi

if [ ! -f ".env.local" ]; then
    echo "   Creating .env.local..."
    echo "VITE_API_URL=http://localhost:5000/api" > .env.local
    echo "   ✅ .env.local created"
else
    echo "   ✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1️⃣  Terminal 1 - Start Backend:"
echo "    cd server && npm start"
echo "    (Server will run on http://localhost:5000)"
echo ""
echo "2️⃣  Terminal 2 - Start Frontend:"
echo "    npm run dev"
echo "    (Frontend will run on http://localhost:5173)"
echo ""
echo "3️⃣  Open browser:"
echo "    http://localhost:5173"
echo ""
echo "📖 Documentation:"
echo "   - Setup: See SETUP_GUIDE.md"
echo "   - Testing: See TESTING_GUIDE.md"
echo "   - Overview: See README.md"
echo "   - Completion Report: See PROJECT_COMPLETION_REPORT.md"
echo ""
echo "✨ Main Fixes Applied:"
echo "   ✅ Task deletion route fixed (DELETE before GET)"
echo "   ✅ Analytics button UI fixed (missing JSX)"
echo "   ✅ API URL configured for localhost development"
echo ""
