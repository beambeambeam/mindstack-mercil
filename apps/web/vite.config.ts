import fs from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3001,
	},
	plugins: [
		{
			name: "multi-page-routing",
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					const url = req.url?.split("?")[0] || "";

					if (
						url.includes(".") &&
						!url.endsWith(".html") &&
						!url.startsWith("/src/") &&
						!url.startsWith("/@")
					) {
						return next();
					}

					if (
						url.startsWith("/src/") ||
						url.startsWith("/node_modules/") ||
						url.startsWith("/@")
					) {
						return next();
					}

					let htmlPath: string | null = null;

					if (url.startsWith("/chat/ai")) {
						htmlPath = resolve(__dirname, "pages/chat/ai/index.html");
					} else if (url.startsWith("/chat")) {
						htmlPath = resolve(__dirname, "pages/chat/index.html");
					} else if (url.startsWith("/search")) {
						htmlPath = resolve(__dirname, "pages/search/index.html");
					} else if (url.startsWith("/detail")) {
						htmlPath = resolve(__dirname, "pages/detail/index.html");
					} else if (url === "/" || url === "/index.html") {
						htmlPath = resolve(__dirname, "pages/index/index.html");
					}

					if (htmlPath && fs.existsSync(htmlPath)) {
						const html = fs.readFileSync(htmlPath, "utf-8");
						res.setHeader("Content-Type", "text/html");
						res.end(html);
						return;
					}

					next();
				});
			},
		},
	],
	build: {
		outDir: "dist",
		rollupOptions: {
			input: {
				main: resolve(__dirname, "pages/index/index.html"),
				search: resolve(__dirname, "pages/search/index.html"),
				chat: resolve(__dirname, "pages/chat/index.html"),
				chatAi: resolve(__dirname, "pages/chat/ai/index.html"),
				detail: resolve(__dirname, "pages/detail/index.html"),
			},
		},
	},
});
