import { renderAssetCards } from "../../src/components/AssetCard";
import type { FilterState } from "../../src/components/FilterOverlay";
import { renderFilterNavigation } from "../../src/components/Header";
import { initMapWithAssets } from "../../src/components/Map";
import { createPropertyTypeTabs } from "../../src/components/PropertyTypeTabs";
import { env } from "../../src/env";
import {
	getAllAssets,
	getAssetById,
	getAssetTypes,
	getUserRecommendations,
} from "../../src/services/api";
import type { Asset, AssetType } from "../../src/types/asset";
import { extractAssetTypes } from "../../src/utils/format";
import "./index.css";

let allAssets: Asset[] = [];
let recommendedAssets: Asset[] = [];
let assetTypes: AssetType[] = [];
let currentAssetTypeFilter = "all";

async function convertRecommendationsToAssets(
	recommendations: Array<{ id: number }>,
): Promise<Asset[]> {
	const assetPromises = recommendations.map((rec) => getAssetById(rec.id));
	const assets = await Promise.all(assetPromises);
	return assets.filter((asset): asset is Asset => asset !== null);
}

export async function init() {
	console.log("Index page initialized");

	const container = document.getElementById("asset-card-container");
	const recommendedContainer = document.getElementById(
		"recommended-asset-card-container",
	);
	const recommendedMapContainer = document.getElementById("recommended-map");

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

		createPropertyTypeTabs(assetTypes, (assetType: string) => {
			currentAssetTypeFilter = assetType;
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
		});

		renderFilterNavigation(assetTypes, (filterState: FilterState) => {
			let filteredList: Asset[] = [];
			if (currentAssetTypeFilter === "all") {
				filteredList = allAssets;
			} else {
				const typeId = parseInt(currentAssetTypeFilter, 10);
				filteredList = allAssets.filter((p) => p.asset_type_id === typeId);
			}

			if (filterState.priceMin !== undefined) {
				const priceMin = filterState.priceMin;
				filteredList = filteredList.filter(
					(p) => p.price !== null && p.price >= priceMin,
				);
			}

			if (filterState.priceMax !== undefined) {
				const priceMax = filterState.priceMax;
				filteredList = filteredList.filter(
					(p) => p.price !== null && p.price <= priceMax,
				);
			}

			if (filterState.bedroomsMin !== undefined) {
				const bedroomsMin = filterState.bedroomsMin;
				filteredList = filteredList.filter(
					(p) => p.bedrooms !== null && p.bedrooms >= bedroomsMin,
				);
			}

			if (filterState.bathroomsMin !== undefined) {
				const bathroomsMin = filterState.bathroomsMin;
				filteredList = filteredList.filter(
					(p) => p.bathrooms !== null && p.bathrooms >= bathroomsMin,
				);
			}

			if (container) {
				renderAssetCards(filteredList, assetTypesForDisplay, container);
			}
		});

		try {
			console.log("Fetching user recommendations...");
			const recommendations = await getUserRecommendations();
			console.log(
				"Recommendations received:",
				recommendations.length,
				recommendations,
			);

			const recommendedSection = document.getElementById("recommended-section");
			console.log("Recommended section element:", recommendedSection);

			if (recommendations.length > 0) {
				console.log("Converting recommendations to assets...");
				recommendedAssets =
					await convertRecommendationsToAssets(recommendations);
				console.log("Converted assets:", recommendedAssets.length);

				const recommendedTypesForDisplay = extractAssetTypes(recommendedAssets);

				if (recommendedSection) {
					recommendedSection.style.display = "block";
					console.log("Showing recommended section");
				}

				if (recommendedContainer) {
					renderAssetCards(
						recommendedAssets,
						recommendedTypesForDisplay,
						recommendedContainer,
					);
				}

				if (recommendedMapContainer) {
					initMapWithAssets("recommended-map", recommendedAssets);
				}

				const recommendedTitleElement = document.querySelectorAll(
					".content-container h1",
				)[1];
				if (recommendedTitleElement) {
					createPropertyTypeTabs(
						assetTypes,
						(assetType: string) => {
							let filteredList: Asset[] = [];
							if (assetType === "all") {
								filteredList = recommendedAssets;
							} else {
								const typeId = parseInt(assetType, 10);
								filteredList = recommendedAssets.filter(
									(p) => p.asset_type_id === typeId,
								);
							}

							if (recommendedContainer) {
								renderAssetCards(
									filteredList,
									recommendedTypesForDisplay,
									recommendedContainer,
								);
							}
							if (recommendedMapContainer) {
								initMapWithAssets("recommended-map", filteredList);
							}
						},
						recommendedTitleElement,
					);
				}
			} else {
				console.log("No recommendations found, hiding section");
				if (recommendedSection) {
					recommendedSection.style.display = "none";
				}
			}
		} catch (recError) {
			console.error("Failed to load recommendations:", recError);
			const recommendedSection = document.getElementById("recommended-section");
			if (recommendedSection) {
				recommendedSection.style.display = "none";
			}
		}
	} catch (error) {
		console.error("Failed to load assets:", error);
		if (container) {
			container.innerHTML = `
				<div style="text-align: center; padding: 50px; color: #d64545;">
					<h2>ไม่สามารถเชื่อมต่อกับ API ได้</h2>
					<p>กรุณาตรวจสอบว่า API server กำลังทำงานอยู่ที่ ${env.VITE_API_URL}</p>
					<p style="font-size: 0.9em; color: #666; margin-top: 10px;">Error: ${
						error instanceof Error ? error.message : String(error)
					}</p>
				</div>
			`;
		}
	}
}
