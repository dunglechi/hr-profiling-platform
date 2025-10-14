#!/bin/bash

# 🚀 Simple Deployment Script for VPS
# Usage: ./deploy.sh [production|staging]

set -e  # Exit on any error

ENVIRONMENT=${1:-production}
PROJECT_NAME="hr-profiling-platform"
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

echo "🚀 Starting deployment to ${ENVIRONMENT}..."

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
print_status "Running pre-deployment checks..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed!"
    exit 1
fi

if [ ! -f "${COMPOSE_FILE}" ]; then
    print_error "Compose file ${COMPOSE_FILE} not found!"
    exit 1
fi

# Pull latest code
print_status "Pulling latest code from GitHub..."
git pull origin main

# Environment validation  
print_status "Validating environment variables..."
if [ ! -f ".env.${ENVIRONMENT}" ]; then
    print_error "Environment file .env.${ENVIRONMENT} not found!"
    exit 1
fi

# Build and deploy
print_status "Building Docker images..."
docker-compose -f ${COMPOSE_FILE} build --no-cache

print_status "Stopping old containers..."
docker-compose -f ${COMPOSE_FILE} down

print_status "Starting new containers..."
docker-compose -f ${COMPOSE_FILE} up -d

# Health check
print_status "Performing health check..."
sleep 30

if curl -f http://localhost:3000/health &> /dev/null; then
    print_status "✅ Deployment successful! Application is healthy."
else
    print_error "❌ Health check failed! Rolling back..."
    docker-compose -f ${COMPOSE_FILE} logs --tail=50
    exit 1
fi

# Cleanup
print_status "Cleaning up unused Docker resources..."
docker system prune -f

print_status "🎉 Deployment completed successfully!"
print_status "🔗 Application URL: http://$(hostname -I | awk '{print $1}'):3000"
print_status "📊 Monitor logs: docker-compose -f ${COMPOSE_FILE} logs -f"

echo ""
echo "📋 Quick Commands:"
echo "  View logs:    docker-compose -f ${COMPOSE_FILE} logs -f"
echo "  Restart:      docker-compose -f ${COMPOSE_FILE} restart"
echo "  Stop:         docker-compose -f ${COMPOSE_FILE} down"
echo "  Status:       docker-compose -f ${COMPOSE_FILE} ps"