const BuildProgress = {
	PREPARING: "preparing",
	INSTALLING: "installing",
	BUILDING: "building",
	UPLOADING: "uploading",
} as const;

const BuildStatus = {
	RUNNING: "running",
	COMPLETED: "completed",
	FAILED: "failed",
} as const;

Bun.serve({
	port: 8080,
	fetch(req, server) {
		if (server.upgrade(req)) {
			return;
		}

		return new Response("Upgrade required", { status: 426 });
	},
	websocket: {
		async message(ws, message) {
			const raw =
				typeof message === "string"
					? message
					: new TextDecoder().decode(message);
			let data: unknown;

			try {
				data = JSON.parse(raw);
			} catch {
				ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
				return;
			}

			if (typeof data !== "object" || data === null) {
				ws.send(
					JSON.stringify({ type: "error", message: "Invalid message format" }),
				);
				return;
			}

			const msg = data as {
				type?: string;
				pkg?: { name?: string; version?: string };
			};

			// Expect first message to be start
			if (msg.type !== "start") {
				ws.send(
					JSON.stringify({
						type: "error",
						message: "Expected 'start' message",
					}),
				);
				return;
			}

			if (!msg.pkg || !msg.pkg.name || !msg.pkg.version) {
				ws.send(
					JSON.stringify({
						type: "error",
						message: "Missing package name or version",
					}),
				);
				return;
			}

			// Simulate build progress
			const steps = [
				{ step: BuildProgress.PREPARING, delay: 500 },
				{ step: BuildProgress.INSTALLING, delay: 1000 },
				{ step: BuildProgress.BUILDING, delay: 1500 },
				{ step: BuildProgress.UPLOADING, delay: 1000 },
			];

			for (const { step, delay } of steps) {
				await new Promise((resolve) => setTimeout(resolve, delay));
				ws.send(
					JSON.stringify({
						type: "progress",
						step,
						status: BuildStatus.RUNNING,
					}),
				);
			}

			// Send completion message
			ws.send(JSON.stringify({ type: "done", status: BuildStatus.COMPLETED }));
			ws.close();
		},
	},
});
