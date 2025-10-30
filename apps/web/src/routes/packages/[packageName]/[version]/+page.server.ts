import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, platform }) => {
	const { packageName, version } = params;

	// If version is not specified or empty, redirect to "latest"
	if (!version || version.trim() === "") {
		throw redirect(302, `/packages/${packageName}/latest`);
	}

	if (!platform?.env) {
		throw new Error("Platform environment not available");
	}

	const { DOCS_BUILDER_ORCHESTRATOR } = platform.env;

	// Get the orchestrator instance by name (using "main" as a singleton)
	const orchestrator = DOCS_BUILDER_ORCHESTRATOR.get(
		DOCS_BUILDER_ORCHESTRATOR.idFromName("main")
	);

	// Enqueue the build request
	await orchestrator.enqueueBuild({
		name: packageName,
		version: version,
	});

	// Get initial build status
	const buildStatus = await orchestrator.getBuildStatus({
		name: packageName,
		version: version,
	});

	return {
		packageName,
		version,
		buildStatus: buildStatus || {
			status: "queued",
			steps: [],
			updatedAt: new Date(),
		},
	};
};
