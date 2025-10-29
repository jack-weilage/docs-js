import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/lib/server/db/schema.ts",
	driver: "d1-http",
	dialect: "sqlite",
	verbose: true,
	strict: true,
});
