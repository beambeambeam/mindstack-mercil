import { renderAssetCards } from "../../src/components/AssetCard";
import { renderFilterNavigation } from "../../src/components/Header";
import { initMapWithAssets } from "../../src/components/Map";
import { env } from "../../src/env";
import { getAllAssets, getAssetTypes } from "../../src/services/api";
import type { Asset, AssetType } from "../../src/types/asset";
import { extractAssetTypes } from "../../src/utils/format";
import "./index.css";

let allAssets: Asset[] = [];
let assetTypes: AssetType[] = [];

export async function init() {
	console.log("Index page initialized");

	const container = document.getElementById("asset-card-container");

	try {
		const [assetsResponse, typesResponse] = await Promise.all([
			getAllAssets(1, 200),
			getAssetTypes(),
		]);

		allAssets = assetsResponse.items;
		assetTypes = typesResponse;

		const assetTypesForDisplay = extractAssetTypes(allAssets);

		if (container) {
			renderAssetCards(allAssets, assetTypesForDisplay, container);
		}

		initMapWithAssets("map", allAssets);

		renderFilterNavigation(assetTypes, (assetType) => {
			let filteredList: Asset[] = [];
			if (assetType === "all") {
				filteredList = allAssets;
			} else {
				const typeId = parseInt(assetType, 10);
				filteredList = allAssets.filter((p) => p.asset_type_id === typeId);
			}

			if (container) {
				renderAssetCards(filteredList, assetTypesForDisplay, container);
			}
			initMapWithAssets("map", filteredList);
		});
	} catch (error) {
		console.error("Failed to load assets:", error);
		if (container) {
			container.innerHTML = `
				<div style="text-align: center; padding: 50px; color: #d64545;">
					<h2>ไม่สามารถเชื่อมต่อกับ API ได้</h2>
					<p>กรุณาตรวจสอบว่า API server กำลังทำงานอยู่ที่ ${env.VITE_API_URL}</p>
					<p style="font-size: 0.9em; color: #666; margin-top: 10px;">Error: ${error instanceof Error ? error.message : String(error)}</p>
				</div>
			`;
		}
	}
}
