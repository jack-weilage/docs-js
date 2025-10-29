import { drizzle } from "drizzle-orm/d1";
import { getRequestEvent } from "$app/server";
import * as schema from "./schema";

export const connect = (platform = getRequestEvent().platform) =>
	drizzle(platform!.env.DOCS_DB, { schema });
