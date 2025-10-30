import { DurableObject } from "cloudflare:workers";

interface Pkg {
	name: string;
	version: string;
}

interface QueueItem {
	key: string;
	pkg: Pkg;
	status: "queued" | "running" | "completed" | "failed";
	steps: string[];
	updatedAt: Date;
}

interface BuildStatus {
	status: "queued" | "running" | "completed" | "failed";
	steps?: string[];
	updatedAt?: Date;
}

const MAX_CONCURRENCY = 1;

export class BuilderOrchestrator extends DurableObject<Env> {
	private async getQueue(): Promise<QueueItem[]> {
		const queue = await this.ctx.storage.get<QueueItem[]>("queue");
		return queue ?? [];
	}

	private async saveQueue(queue: QueueItem[]): Promise<void> {
		await this.ctx.storage.put("queue", queue);
	}

	private async markItemFailed(key: string): Promise<void> {
		const queue = await this.getQueue();

		const item = queue.find((i) => i.key === key);
		if (item?.status === "running") {
			item.status = "failed";
			item.updatedAt = new Date();
			await this.saveQueue(queue);
		}
	}

	private async processQueue(): Promise<void> {
		const queue = await this.getQueue();
		const running = queue.filter((item) => item.status === "running");

		if (running.length >= MAX_CONCURRENCY) {
			return;
		}

		const nextItem = queue.find((item) => item.status === "queued");
		if (!nextItem) {
			return;
		}

		// Mark as running
		nextItem.status = "running";
		nextItem.updatedAt = new Date();
		await this.saveQueue(queue);

		// Start container and connect via WebSocket
		const container = this.env.BUILDER_CONTAINER.getByName(nextItem.key);
		await container.startAndWaitForPorts(8080);

		// Open WebSocket connection
		const { webSocket: ws } = await container.fetch("http://container/ws", {
			headers: {
				Upgrade: "websocket",
				Connection: "Upgrade",
			},
		});

		if (!ws) {
			await this.markItemFailed(nextItem.key);
			return;
		}

		ws.accept();

		// Send start message
		ws.send(JSON.stringify({ type: "start", pkg: nextItem.pkg }));

		// Handle messages
		ws.addEventListener("message", async (evt) => {
			const raw =
				typeof evt.data === "string"
					? evt.data
					: new TextDecoder().decode(evt.data);
			let msg: unknown;

			try {
				msg = JSON.parse(raw);
			} catch {
				return;
			}

			if (typeof msg !== "object" || msg === null) {
				return;
			}

			const queue = await this.getQueue();
			const item = queue.find((i) => i.key === nextItem.key);
			if (!item) {
				return;
			}

			const message = msg as { type?: string; step?: string; status?: string };

			if (message.type === "progress") {
				if (message.step) {
					item.steps.push(message.step);
				}
				item.status = message.status === "running" ? "running" : item.status;
				item.updatedAt = new Date();
			} else if (message.type === "done") {
				item.status = message.status === "completed" ? "completed" : "failed";
				item.updatedAt = new Date();
			}

			await this.saveQueue(queue);
		});

		// Handle close
		ws.addEventListener("close", async () => {
			// Only marks as failed if the item is still running
			await this.markItemFailed(nextItem.key);
			await this.processQueue();
		});

		// Handle errors
		ws.addEventListener("error", async () => {
			await this.markItemFailed(nextItem.key);
			await this.processQueue();
		});
	}

	public async enqueueBuild(pkg: Pkg): Promise<void> {
		const key = `${pkg.name}@${pkg.version}`;
		const queue = await this.getQueue();

		// Check if already exists
		if (queue.some((item) => item.key === key)) {
			return;
		}

		// Add to queue
		queue.push({
			key,
			pkg,
			status: "queued",
			steps: [],
			updatedAt: new Date(),
		});

		await this.saveQueue(queue);
		await this.processQueue();
	}

	public async getBuildStatus(pkg: Pkg): Promise<BuildStatus | undefined> {
		const queue = await this.getQueue();
		const item = queue.find((i) => i.key === `${pkg.name}@${pkg.version}`);

		if (!item) {
			return undefined;
		}

		return {
			status: item.status,
			steps: item.steps,
			updatedAt: item.updatedAt,
		};
	}
}
