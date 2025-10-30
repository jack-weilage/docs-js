# `@docs-js/builder-container`

This is the documentation builder Docker container, used to build the documentation JSON for the 
docs.js.org website. Each instance of the container is responsible for building the documentation 
for a single npmjs package and will be shutdown after the build is complete.

Upon startup, the container starts a Bun WebSocket server that listens for messages from the 
orchestrator. The orchestrator will send a start message with the package name and version to the 
container, and the container will simulate the build process.

## WebSocket Protocol

The container exposes a single WebSocket endpoint at `/ws`. The protocol works as follows:

1. **Start message**: The orchestrator sends:
   ```json
   { "type": "start", "pkg": { "name": "react", "version": "18.2.0" } }
   ```

2. **Progress updates**: The container sends progress messages:
   ```json
   { "type": "progress", "step": "preparing", "status": "running" }
   { "type": "progress", "step": "installing", "status": "running" }
   { "type": "progress", "step": "building", "status": "running" }
   { "type": "progress", "step": "uploading", "status": "running" }
   ```

3. **Completion**: The container sends a final message and closes:
   ```json
   { "type": "done", "status": "completed" }
   ```

Currently, the container simulates build progress with mocked steps. Future implementations will 
download the tarball from the npmjs registry, install dependencies using Bun, build the documentation, 
and send the JSON to the orchestrator.
