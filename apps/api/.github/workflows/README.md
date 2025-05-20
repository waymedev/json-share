# GitHub Actions Workflows

## Docker Publish Workflow

The `docker-publish.yml` workflow automatically builds and publishes Docker images to GitHub Container Registry (ghcr.io) when:

1. A new release is published on GitHub
2. The workflow is manually triggered

### How it works

When a new release is created (e.g., v1.0.0):

1. GitHub Actions will build a Docker image from the Dockerfile in this repository
2. Multiple tags will be created automatically:
   - Full version tag (e.g., `ghcr.io/owner/json-share/json-share-api:1.0.0`)
   - Major.minor tag (e.g., `ghcr.io/owner/json-share/json-share-api:1.0`)
   - Branch reference tag if triggered from a branch
   - Short SHA tag for commit-specific references

### Using the published images

To use the published Docker images:

1. Create a `.env` file next to your `docker-compose.yml` with:

   ```
   GITHUB_REPO=your-github-username/json-share
   VERSION=1.0.0
   ```

2. Run docker-compose:
   ```
   docker-compose up -d
   ```

### Authentication

To pull private images locally:

1. Log in to GitHub Container Registry:

   ```
   echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
   ```

2. Make sure your GitHub token has the `read:packages` scope
