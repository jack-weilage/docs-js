# `@docs-js/builder-container`

This is the documentation builder Docker container, used to build the documentation JSON for the 
docs.js.org website. Each instance of the container is responsible for building the documentation 
for a single npmjs package and will be shutdown after the build is complete.

Upon startup, the container starts a Bun WebSocket server that listens for messages from the 
container Worker. The Worker will send the package name and version to the container, and the 
container will download the tarball from the npmjs registry and install the dependencies using Bun.

Once downloaded, the container will build the documentation for the package and send the JSON to 
the Worker. The Worker will then store the JSON in the R2 bucket and shutdown the container.

Throughout the entire process, the container sends progress updates to the Worker.
