Bun.serve({
	port: 8080,
	fetch(req, server) {
		if (server.upgrade(req)) {
			return;
		}

		return new Response("Upgrade failed", { status: 500 });
	},
	websocket: {
		async message(ws, message) {
			console.log("Message received:", message);
			ws.send("Hello from server");
		},
	},
});
