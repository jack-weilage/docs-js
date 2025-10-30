import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, platform }) => {
	const { packageName, version } = params;

	if (!platform?.env) {
		return json({ error: "Platform environment not available" }, { status: 500 });
	}

	const { DOCS_BUILDER_ORCHESTRATOR } = platform.env;

	try {
		// Get the orchestrator instance by name (using "main" as a singleton)
		const orchestrator = DOCS_BUILDER_ORCHESTRATOR.get(
			DOCS_BUILDER_ORCHESTRATOR.idFromName("main")
		);

		// Get build status
		const buildStatus = await orchestrator.getBuildStatus({
			name: packageName,
			version: version,
		});

		if (!buildStatus) {
			return json(
				{
					error: "Build status not found",
					buildStatus: {
						status: "queued",
						steps: [],
						updatedAt: new Date(),
					},
				},
				{ status: 404 }
			);
		}

		return json({
			buildStatus,
		});
	} catch (error) {
		console.error("Error fetching build status:", error);
		return json(
			{
				error: "Failed to fetch build status",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
};
