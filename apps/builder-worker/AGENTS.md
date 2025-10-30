# AGENTS.md

## Commands

- **Lint**: `bun lint`
- **Format**: `bun format`
- **Type Generate**: `bun cf-typegen`

## Architecture

- **Stack**: Bun + Cloudflare Workers
- **Database**: Cloudflare D1 with Drizzle ORM
- **Storage**: Cloudflare R2 for documentation objects
- **Containers**: Cloudflare Containers for serverless Docker ([builder-container](../builder-container))

## Components

- [**BuilderContainer**](./src/container.ts): A Cloudflare Container that is responsible for 
  building the documentation.
- [**BuilderOrchestrator**](./src/orchestrator.ts): A Durable Object that is responsible for 
  coordinating the builder containers.
- [**BuilderWorker**](./src/index.ts): The main Worker that is responsible for receiving requests 
  from the web application and forwarding them to the builder orchestrator. Additionally, it acts 
  as a WebSocket server, allowing the user to receive progress updates on their requested builds.