FROM node:22-alpine

WORKDIR /app

# Add build arguments
ARG NODE_ENV
ARG PORT
ARG DATABASE_URL

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT
ENV DATABASE_URL=$DATABASE_URL

# Copy package.json
COPY package.json ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose the port the app runs on
EXPOSE ${PORT:-3000}

# Command to run the application
CMD ["pnpm", "start"] 