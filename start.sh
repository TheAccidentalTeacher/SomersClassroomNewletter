#!/bin/bash

# Railway startup script for Newsletter Generator

echo "🚀 Starting Newsletter Generator deployment..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build client
echo "🔨 Building client..."
cd client
npm install
npm run build
cd ..

# Build server  
echo "🔨 Building server..."
cd server
npm install
npm run build
cd ..

# Start the application
echo "▶️ Starting server..."
cd server && npm start
