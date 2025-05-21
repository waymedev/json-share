# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## API Configuration

The API endpoint is configurable via the `VITE_API_BASE_URL` environment variable:

- By default (for local development): `http://127.0.0.1:3000/api`
- In Docker: The docker-compose.yml sets `VITE_API_BASE_URL=http://api:3000/api`

You can customize this by creating an `.env` file in the project root:

```
# .env file example
VITE_API_BASE_URL=http://your-custom-api:3000/api
```
