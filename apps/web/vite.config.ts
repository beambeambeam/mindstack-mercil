import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3001,
	},
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
