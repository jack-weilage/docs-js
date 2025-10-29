# `@docs-js/builder-worker`

This package contains three main components:

- `BuilderContainer`: A Cloudflare Container that is responsible for building the documentation 
  for a single npmjs package. The Docker container can be found in the 
  [`@docs-js/builder-container`](../builder-container) package.
- `BuilderManager`: A Durable Object that is responsible for coordinating the builder containers.
  An SQLite database is used to store the state of requested builds, acting as a queue.
- `BuilderWorker`: The main Worker that is responsible for receiving requests from the web 
  application and forwarding them to the builder manager. Additionally, it acts as a WebSocket 
  server, allowing the user to receive progress updates on their requested builds.
