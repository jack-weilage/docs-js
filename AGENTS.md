# AGENTS.md

## Architecture
- **Monorepo** with workspaces: `apps/*` (web, builder-worker, builder-container) and `packages/*` (extractor)
- **Stack**: SvelteKit + Tailwind CSS for web app, deployed to Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM, schema at `apps/web/src/lib/server/db/schema.ts`
- **Storage**: Cloudflare R2 for documentation objects
- **Containers**: Cloudflare Containers for serverless Docker (builder-container)
- **Builder**: Worker coordinates container builds for npm package documentation

## Code Style
- **Formatter**: Biome with tabs for indentation, double quotes for strings
- **TypeScript**: Strict mode enabled, ESNext target, bundler module resolution
- **Imports**: Use `"$app/*"` for SvelteKit imports, named imports preferred
- **Organize imports**: Enabled via Biome assist
