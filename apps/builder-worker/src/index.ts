import { DurableObject } from "cloudflare:workers";
import { Container } from "@cloudflare/containers";

export class BuilderContainer extends Container {
	defaultPort = 8080;
	sleepAfter = "1m";
}

export class BuilderManager extends DurableObject<Env> {
	public async startBuilder(packageName: string) {
		const container: DurableObjectStub<BuilderContainer> =
			this.env.BUILDER_CONTAINER.getByName(packageName);

		await container.startAndWaitForPorts(8080);
	}
}

export default {
	async fetch(request: Request, env: Env) {
		const container: DurableObjectStub<BuilderManager> =
			env.BUILDER_MANAGER.getByName("main");

		return new Response("Hello, world!");
	},
} satisfies ExportedHandler<Env>;
