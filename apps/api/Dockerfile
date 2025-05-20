FROM node:20-alpine

WORKDIR /app

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
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "start"] 