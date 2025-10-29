import { DurableObject } from "cloudflare:workers";
import type { BuilderContainer } from "./container";

export class BuilderOrchestrator extends DurableObject<Env> {
	public async enqueueBuild(packageName: string, packageVersion: string) {
		await this.ctx.storage.put({
			packageName,
			packageVersion,
			status: "pending",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
	}

	public async startBuilder(packageName: string) {
		const container: DurableObjectStub<BuilderContainer> =
			this.env.BUILDER_CONTAINER.getByName(packageName);

		await container.startAndWaitForPorts(8080);
	}
}
