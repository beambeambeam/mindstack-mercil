import type { Asset, AssetResult, SearchFilter } from "../types/asset";
import { parseQueryForFilters } from "../utils/filters";
import { getAllAssets, searchAssets } from "./api";

export function simpleTextSearch(
	properties: Asset[],
	searchTerm: string,
): Asset[] {
	if (!searchTerm) return properties;
	const term = searchTerm.toLowerCase().trim();
	return properties.filter(
		(p) =>
			p.name_th?.toLowerCase().includes(term) ||
			p.asset_code?.toLowerCase().includes(term),
	);
}

export async function hybridSearchAPI(query: string): Promise<Asset[]> {
	if (!query) {
		const allAssets = await getAllAssets(1, 200);
		return allAssets.items;
	}

	const parsedFilters = parseQueryForFilters(query);

	const request = {
		query_text: parsedFilters.query.trim(),
		filters: {
			price_max: parsedFilters.price_max,
		},
		pagination: {
			page: 1,
			page_size: 200,
		},
	};

	try {
		const data = await searchAssets(request);
		const results = data.results || [];

		const allAssets = await getAllAssets(1, 200);
		const assetMap = new Map(
			allAssets.items.map((asset) => [asset.asset_code, asset]),
		);

		const rankedAssets = results
			.map((result: AssetResult) => assetMap.get(result.asset_code))
			.filter((asset): asset is Asset => asset !== undefined);

		return rankedAssets;
	} catch (error) {
		console.error(
			"Network or Fetch Error, Falling back to simple search:",
			error,
		);
		try {
			const allAssets = await getAllAssets(1, 200);
			return simpleTextSearch(allAssets.items, query);
		} catch (fallbackError) {
			console.error("Fallback fetch failed:", fallbackError);
			return [];
		}
	}
}

export function getParsedFilters(query: string): SearchFilter {
	return parseQueryForFilters(query);
}
