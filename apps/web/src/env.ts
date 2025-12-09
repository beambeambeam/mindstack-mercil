import { z } from "zod";

const envSchema = z.object({
	VITE_API_URL: z.string().url().describe("API base URL"),
});

function getEnv() {
	const rawEnv = {
		VITE_API_URL: import.meta.env.VITE_API_URL || "http://localhost:8000",
	};

	const parsed = envSchema.safeParse(rawEnv);

	if (!parsed.success) {
		console.error(
			"❌ Invalid environment variables:",
			parsed.error.flatten().fieldErrors,
		);
		throw new Error("Invalid environment variables");
	}

	return parsed.data;
}

export const env = getEnv();
