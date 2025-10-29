export { BuilderContainer } from "./container";
export { BuilderOrchestrator } from "./orchestrator";

export default {
	async fetch(request: Request, env: Env) {
		const orchestrator = env.BUILDER_ORCHESTRATOR.getByName("main");

		await orchestrator.enqueueBuild("react", "18.2.0");

		return new Response("Hello, world!");
	},
} satisfies ExportedHandler<Env>;
