# `@docs-js/builder-worker`

This package contains two main components:

- `BuilderContainer`: A Cloudflare Container that is responsible for building the documentation 
  for a single npmjs package. The Docker container can be found in the 
  [`@docs-js/builder-container`](../builder-container) package.
- `BuilderOrchestrator`: A Durable Object that is responsible for coordinating the builder containers.
  It maintains a queue of build requests and manages container lifecycle.

## Usage

The `BuilderOrchestrator` exposes RPC methods that can be called directly from other Workers via bindings:

```typescript
// Get the orchestrator instance
const orchestrator = env.BUILDER_ORCHESTRATOR.getByName("main");

// Enqueue a build
await orchestrator.enqueueBuild({ name: "react", version: "18.2.0" });

// Check build status
const status = await orchestrator.getBuildStatus({ name: "react", version: "18.2.0" });
// Returns: { status: "queued" | "running" | "completed" | "failed" | "not_found", steps?: string[], updatedAt?: string }
```
