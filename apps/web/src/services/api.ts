import { env } from "../env";
import type {
	Asset,
	AssetListResponse,
	SearchRequest,
	SearchResponse,
} from "../types/asset";

const API_URL = env.VITE_API_URL;

export async function searchAssets(
	request: SearchRequest,
): Promise<SearchResponse> {
	const url = `${API_URL}/search`;
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const text = await response.text();
		console.error(
			`API Error ${response.status} ${response.statusText} from ${url}`,
		);
		console.error("Response:", text.substring(0, 500));
		throw new Error(
			`API Error: ${response.status} ${response.statusText}. Check if the API server is running at ${API_URL}`,
		);
	}

	return parseJsonResponse<SearchResponse>(response, url);
}

async function parseJsonResponse<T>(
	response: Response,
	url: string,
): Promise<T> {
	const contentType = response.headers.get("content-type");
	if (!contentType || !contentType.includes("application/json")) {
		const text = await response.text();
		console.error(`Expected JSON but got ${contentType} from ${url}`);
		console.error("Response:", text.substring(0, 500));
		throw new Error(
			`API returned non-JSON response. Expected JSON but got ${contentType}. Check if the API server is running at ${url}`,
		);
	}

	try {
		return await response.json();
	} catch (error) {
		const text = await response.text();
		console.error(`Failed to parse JSON from ${url}:`, error);
		console.error("Response:", text.substring(0, 500));
		throw new Error(
			`Failed to parse JSON response from ${url}. Response may be HTML error page. ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

export async function getAllAssets(
	page: number = 1,
	pageSize: number = 200,
): Promise<AssetListResponse> {
	const url = `${API_URL}/assets?page=${page}&page_size=${pageSize}`;
	console.log(`Fetching assets from: ${url}`);

	const response = await fetch(url);

	if (!response.ok) {
		const text = await response.text();
		console.error(
			`API Error ${response.status} ${response.statusText} from ${url}`,
		);
		console.error("Response:", text.substring(0, 500));
		throw new Error(
			`API Error: ${response.status} ${response.statusText}. Check if the API server is running at ${API_URL}`,
		);
	}

	return parseJsonResponse<AssetListResponse>(response, url);
}

export async function getAssetById(assetId: number): Promise<Asset> {
	const url = `${API_URL}/assets/${assetId}`;
	const response = await fetch(url);

	if (!response.ok) {
		const text = await response.text();
		console.error(
			`API Error ${response.status} ${response.statusText} from ${url}`,
		);
		console.error("Response:", text.substring(0, 500));
		throw new Error(
			`API Error: ${response.status} ${response.statusText}. Check if the API server is running at ${API_URL}`,
		);
	}

	return parseJsonResponse<Asset>(response, url);
}

export async function getAssetByCode(assetCode: string): Promise<Asset> {
	const allAssets = await getAllAssets(1, 200);
	const asset = allAssets.items.find((a) => a.asset_code === assetCode);
	if (!asset) {
		throw new Error(`Asset with code ${assetCode} not found`);
	}
	return asset;
}
