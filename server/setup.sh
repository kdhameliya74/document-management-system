#!/bin/bash

echo "🚀 Setting up Document Management System Server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  IMPORTANT: Update the following in .env:"
    echo "   - MONGODB_URI (your MongoDB connection string)"
    echo "   - JWT_SECRET (generate a secure random string)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Create uploads directory
if [ ! -d uploads ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads
    echo "✅ Uploads directory created"
else
    echo "✅ Uploads directory already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure MongoDB is running"
echo "   2. Update .env with your MongoDB URI and JWT secret"
echo "   3. Run 'npm run dev' to start the server"
echo ""
echo "📚 Documentation:"
echo "   - DOCUMENTATION.md - Complete schema and security guide"
echo "   - API_TESTING.md - API endpoint testing examples"
echo "   - README.md - General server information"
echo ""
