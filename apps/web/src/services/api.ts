import { env } from "../env";
import type {
	Asset,
	AssetListResponse,
	AssetType,
	AssetTypeListResponse,
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

export async function searchAssetsGET(params: {
	query_text?: string;
	price_min?: number;
	price_max?: number;
	bedrooms_min?: number;
	asset_type_id?: number | number[];
	page?: number;
	page_size?: number;
}): Promise<SearchResponse> {
	const urlParams = new URLSearchParams();

	if (params.query_text) {
		urlParams.append("query_text", params.query_text);
	}

	if (params.price_min !== undefined) {
		urlParams.append("price_min", String(params.price_min));
	}

	if (params.price_max !== undefined) {
		urlParams.append("price_max", String(params.price_max));
	}

	if (params.bedrooms_min !== undefined) {
		urlParams.append("bedrooms_min", String(params.bedrooms_min));
	}

	if (params.asset_type_id !== undefined) {
		if (Array.isArray(params.asset_type_id)) {
			for (const id of params.asset_type_id) {
				urlParams.append("asset_type_id", String(id));
			}
		} else {
			urlParams.append("asset_type_id", String(params.asset_type_id));
		}
	}

	if (params.page !== undefined) {
		urlParams.append("page", String(params.page));
	}

	if (params.page_size !== undefined) {
		urlParams.append("page_size", String(params.page_size));
	}

	const url = `${API_URL}/search?${urlParams.toString()}`;
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

export async function getAssetTypes(): Promise<AssetType[]> {
	const url = `${API_URL}/assets/asset-types`;
	console.log(`Fetching asset types from: ${url}`);

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

	const data = await parseJsonResponse<AssetTypeListResponse>(response, url);
	return data.items;
}
