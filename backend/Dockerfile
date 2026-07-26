FROM node:20-alpine

# Set NODE_ENV to production
ENV NODE_ENV=production

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies only to optimize image size
RUN npm ci --only=production || npm install --omit=dev

# Copy backend source files
COPY . .

# Expose backend service port
EXPOSE 5000

# Start backend in production mode
CMD ["npm", "start"]
