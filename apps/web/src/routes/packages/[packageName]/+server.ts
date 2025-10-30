import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
	const { packageName } = params;
	// Redirect to the latest version
	throw redirect(302, `/packages/${packageName}/latest`);
};
