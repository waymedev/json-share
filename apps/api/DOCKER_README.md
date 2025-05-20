# JSON Share API Docker Deployment

This document provides instructions for deploying the JSON Share API using Docker.

## Prerequisites

- Docker
- Docker Compose

## Deployment Options

### Option 1: Using Pre-built Images from GitHub Container Registry

This is the recommended approach. The GitHub CI automatically builds and publishes Docker images after each release.

1. Create a `.env` file with:

   ```
   GITHUB_REPO=your-github-username/json-share
   VERSION=1.0.0  # Replace with the desired version
   ```

2. Start the containers:

   ```bash
   docker-compose up -d
   ```

### Option 2: Building Locally

If you prefer to build the image locally:

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Build and start the Docker containers:

   ```bash
   docker-compose up -d
   ```

## Configuration

Create a `.env` file based on the following example:

```
# Image Configuration (for Option 1)
GITHUB_REPO=your-github-username/json-share
VERSION=1.0.0

# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DATABASE_URL=mysql://user:password@db:3306/json_share
```

You can modify the following environment variables in the `docker-compose.yml` file:

### API Service:

- `NODE_ENV`: Set to `production` for production environments
- `PORT`: The port on which the API will run
- `DATABASE_URL`: Connection string for the MySQL database

### Database Service:

- `MYSQL_ROOT_PASSWORD`: Root password for MySQL
- `MYSQL_DATABASE`: Database name
- `MYSQL_USER`: MySQL user
- `MYSQL_PASSWORD`: MySQL password

## Data Persistence

The MySQL data is persisted in a Docker volume named `mysql_data`.
The application logs are mounted to the host's `./logs` directory.

## Database Initialization

The database is automatically initialized using the `init.sql` script, which creates the necessary tables on first startup. This script is mounted in the MySQL container's initialization directory.

## CI/CD Pipeline

The project includes GitHub Actions workflows that automatically:

1. Build the Docker image when a new release is published
2. Push the image to GitHub Container Registry (ghcr.io)
3. Create multiple tags for the image:
   - Full version tag (e.g., `1.0.0`)
   - Major.minor tag (e.g., `1.0`)
   - Latest tag for the most recent release

## Troubleshooting

1. If the API fails to connect to the database, you may need to restart the API container after the database is fully initialized: `docker-compose restart api`
2. Check the logs using `docker-compose logs api` or `docker-compose logs db`.
3. For authentication issues with the GitHub Container Registry:
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
   ```
   Make sure your GitHub token has the `read:packages` scope.
