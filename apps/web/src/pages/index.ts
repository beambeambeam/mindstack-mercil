import { renderAssetCards } from "../components/AssetCard";
import { renderFilterNavigation } from "../components/Header";
import { initMapWithAssets } from "../components/Map";
import { getAllAssets, getAssetTypes } from "../services/api";
import type { Asset, AssetType } from "../types/asset";
import { extractAssetTypes } from "../utils/format";

let allAssets: Asset[] = [];
let assetTypes: AssetType[] = [];

export async function init(): Promise<void> {
	const container = document.getElementById("asset-card-container");
	const mapContainer = document.getElementById("map");

	if (!container) return;

	try {
		container.innerHTML =
			'<p style="text-align: center; padding: 50px;">กำลังโหลดข้อมูล...</p>';

		const [assetsResponse, typesResponse] = await Promise.all([
			getAllAssets(1, 200),
			getAssetTypes(),
		]);

		allAssets = assetsResponse.items;
		assetTypes = typesResponse;

		const assetTypesForDisplay = extractAssetTypes(allAssets);

		renderAssetCards(allAssets, assetTypesForDisplay, container);

		if (mapContainer) {
			initMapWithAssets("map", allAssets);
		}

		renderFilterNavigation(assetTypes, (assetType) => {
			let filteredList: Asset[] = [];
			if (assetType === "all") {
				filteredList = allAssets;
			} else {
				const typeId = parseInt(assetType, 10);
				filteredList = allAssets.filter((p) => p.asset_type_id === typeId);
			}
			renderAssetCards(filteredList, assetTypesForDisplay, container);
			if (mapContainer) {
				initMapWithAssets("map", filteredList);
			}
		});
	} catch (error) {
		console.error("Error loading assets:", error);
		if (container) {
			container.innerHTML =
				'<p style="text-align: center; padding: 50px; color: red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
		}
	}
}
