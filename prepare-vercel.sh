# Vercel Production Build
# Copy files from frontend to root for easier deployment

# Copy package.json from frontend to root
cp frontend/package.json ./package-frontend.json

# Copy necessary frontend files
echo "Frontend files ready for Vercel deployment"