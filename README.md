# docs.js.org

This is the core monorepo for the docs.js.org website. It contains the following packages:

- [**@docs-js/web**](apps/web): The main web application for the docs.js.org website.
- [**@docs-js/builder-worker**](apps/builder-worker): The documentation builder Worker, used to
  manage and coordinate the documentation builder containers.
- [**@docs-js/builder-container**](apps/builder-container): The documentation builder Docker
  container, used to build the documentation JSON for the docs.js.org website.
- [**@docs-js/extractor**](packages/extractor): A package used to extract documentation information
  from a npmjs package.

## Architecture

The website is built with SvelteKit and styled with Tailwind CSS. It is hosted on Cloudflare 
Workers and uses Cloudflare D1 for the database and R2 for the documentation object storage.

The documentation builder is a Cloudflare Worker that manages and coordinates the documentation 
builder containers. The containers are responsible for building the documentation JSON for a single
npmjs package and will be shutdown after the build is complete.