#!/bin/bash

# UniConnect Learning Hub Frontend Deployment Script

echo "🚀 Starting deployment for uniconnect-learninghub.co.ke..."

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images
echo "🧹 Cleaning up old images..."
docker image prune -f

# Build and start new containers
echo "🔨 Building and starting new containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Show status
echo "✅ Deployment complete!"
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

echo "🌐 Your app should be available at: http://uniconnect-learninghub.co.ke"