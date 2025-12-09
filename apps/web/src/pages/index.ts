import { renderAssetCards } from "../components/AssetCard";
import type { FilterState } from "../components/FilterOverlay";
import { openFilterOverlay, setAssetType } from "../components/FilterOverlay";
import { renderFilterNavigation } from "../components/Header";
import { initMapWithAssets } from "../components/Map";
import { createPropertyTypeTabs } from "../components/PropertyTypeTabs";
import { getAllAssets, getAssetTypes } from "../services/api";
import type { Asset, AssetType } from "../types/asset";
import { extractAssetTypes } from "../utils/format";

let allAssets: Asset[] = [];
let assetTypes: AssetType[] = [];
let currentAssetTypeFilter = "all";

function applyFilters(
	filterState: FilterState,
	assetTypeFilter: string,
): Asset[] {
	let filteredList: Asset[] = [...allAssets];

	if (assetTypeFilter !== "all") {
		const typeId = parseInt(assetTypeFilter, 10);
		filteredList = filteredList.filter((p) => p.asset_type_id === typeId);
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

	return filteredList;
}

function renderFilteredAssets(
	container: HTMLElement,
	mapContainer: HTMLElement | null,
	assetTypesForDisplay: AssetType[],
	filterState: FilterState,
): void {
	const filteredList = applyFilters(filterState, currentAssetTypeFilter);
	renderAssetCards(filteredList, assetTypesForDisplay, container);
	if (mapContainer) {
		initMapWithAssets("map", filteredList);
	}
}

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

		createPropertyTypeTabs(assetTypes, (assetType: string) => {
			currentAssetTypeFilter = assetType;
			setAssetType(assetType);
			const filterState = { assetType: "all" };
			renderFilteredAssets(
				container,
				mapContainer,
				assetTypesForDisplay,
				filterState,
			);
		});

		renderFilterNavigation(assetTypes, (filterState: FilterState) => {
			renderFilteredAssets(
				container,
				mapContainer,
				assetTypesForDisplay,
				filterState,
			);
		});

		document.body.addEventListener("click", (e) => {
			const target = e.target as HTMLElement;
			const header = document.querySelector(".main-header");
			const overlay = document.getElementById("filter-overlay");
			const filterInput = document.querySelector(
				".asset-filter-nav input",
			) as HTMLElement;

			if (
				header &&
				!header.contains(target) &&
				!filterInput?.contains(target) &&
				overlay &&
				!overlay.contains(target)
			) {
				openFilterOverlay();
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
