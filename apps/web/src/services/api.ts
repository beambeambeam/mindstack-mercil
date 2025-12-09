import type {
	Asset,
	AssetListResponse,
	SearchRequest,
	SearchResponse,
} from "../types/asset";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function searchAssets(
	request: SearchRequest,
): Promise<SearchResponse> {
	const response = await fetch(`${API_URL}/search`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		throw new Error(`API Error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

export async function getAllAssets(
	page: number = 1,
	pageSize: number = 200,
): Promise<AssetListResponse> {
	const response = await fetch(
		`${API_URL}/assets?page=${page}&page_size=${pageSize}`,
	);

	if (!response.ok) {
		throw new Error(`API Error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

export async function getAssetById(assetId: number): Promise<Asset> {
	const response = await fetch(`${API_URL}/assets/${assetId}`);

	if (!response.ok) {
		throw new Error(`API Error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

export async function getAssetByCode(assetCode: string): Promise<Asset> {
	const allAssets = await getAllAssets(1, 200);
	const asset = allAssets.items.find((a) => a.asset_code === assetCode);
	if (!asset) {
		throw new Error(`Asset with code ${assetCode} not found`);
	}
	return asset;
}
