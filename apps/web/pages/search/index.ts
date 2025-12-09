import { renderAssetCards } from "../../src/components/AssetCard";
import { getAllAssets, getAssetTypes } from "../../src/services/api";
import { getParsedFilters, hybridSearchAPI } from "../../src/services/search";
import searchStyles from "../../src/styles/modules/search.module.css";
import type { Asset, AssetType } from "../../src/types/asset";
import { extractAssetTypes, formatPrice } from "../../src/utils/format";
import "./index.css";

let allAssets: Asset[] = [];
let assetTypes: AssetType[] = [];
let latestParsedFilters: ReturnType<typeof getParsedFilters> = {
	query: "",
};

async function applySearch() {
	const searchInput = document.getElementById(
		"search-input",
	) as HTMLInputElement;
	const searchTerm = searchInput ? searchInput.value.trim() : "";
	const container = document.getElementById("asset-card-container");

	if (!container) {
		console.error("Asset card container not found.");
		return;
	}

	try {
		const [assetsResponse, typesResponse] = await Promise.all([
			getAllAssets(1, 200),
			getAssetTypes(),
		]);
		allAssets = assetsResponse.items;
		assetTypes = typesResponse;
	} catch (error) {
		console.error("Error loading assets:", error);
	}

	const assetTypesForDisplay = extractAssetTypes(allAssets);

	latestParsedFilters = getParsedFilters(searchTerm);

	if (!searchTerm) {
		renderAssetCards(allAssets, assetTypesForDisplay, container);
		return;
	}

	container.innerHTML = `<p class="${searchStyles.loadingMessage}">กำลังค้นหาทรัพย์สินอัจฉริยะ...</p>`;

	const results = await hybridSearchAPI(searchTerm);

	if (results.length === 0) {
		let zeroResultHTML = `<p class="${searchStyles.noResultsMessage}">ไม่พบผลลัพธ์ที่เกี่ยวข้องกับ "${searchTerm}"</p>`;

		const queryHasFilters =
			latestParsedFilters.price_max || latestParsedFilters.radius_km;

		if (queryHasFilters) {
			const newPrice = latestParsedFilters.price_max
				? formatPrice(latestParsedFilters.price_max * 1.1)
				: null;
			const newRadius = latestParsedFilters.radius_km
				? (latestParsedFilters.radius_km * 1.5).toFixed(0)
				: null;
			const baseQuery = latestParsedFilters.query.trim();

			let alternativePriceQuery = "";
			if (latestParsedFilters.price_max) {
				alternativePriceQuery = `${baseQuery} ไม่เกิน ${newPrice} บาท`;
			}

			let alternativeRadiusQuery = "";
			if (
				latestParsedFilters.radius_km &&
				latestParsedFilters.location_keyword
			) {
				alternativeRadiusQuery = `${baseQuery} ในระยะ ${newRadius} km จาก ${latestParsedFilters.location_keyword}`;
			} else if (latestParsedFilters.radius_km) {
				alternativeRadiusQuery = `${baseQuery} ในระยะ ${newRadius} km`;
			}

			zeroResultHTML += `
        <div class="${searchStyles.alternativeOptions}">
            <h3 class="${searchStyles.suggestionTitle}">💡 ข้อเสนอแนะทางเลือก:</h3>
            <p>เราไม่พบทรัพย์สินที่ตรงตามเงื่อนไขทุกประการ แต่คุณอาจสนใจ:</p>
            <ul>
                ${
									newPrice && alternativePriceQuery
										? `<li><a href="#" onclick="window.searchByAlternative('${alternativePriceQuery}', event)">ค้นหาโดยเพิ่มงบประมาณเป็น <strong>${newPrice} บาท</strong> (เพิ่ม 10%)</a></li>`
										: ""
								}
                ${
									newRadius && alternativeRadiusQuery
										? `<li><a href="#" onclick="window.searchByAlternative('${alternativeRadiusQuery}', event)">ค้นหาโดยขยายรัศมีเป็น <strong>${newRadius} กม.</strong> (ขยาย 50%)</a></li>`
										: ""
								}
            </ul>
        </div>
      `;
		}
		container.innerHTML = zeroResultHTML;
	} else {
		const assetTypesForDisplay = extractAssetTypes(allAssets);
		renderAssetCards(results, assetTypesForDisplay, container);
	}
}

export function init() {
	console.log("Search page initialized");

	const searchInput = document.getElementById(
		"search-input",
	) as HTMLInputElement;
	const searchButton = document.getElementById("search-button");

	if (searchInput) {
		searchInput.addEventListener("keyup", (e) => {
			if (e.key === "Enter") {
				applySearch();
			} else if (
				searchInput.value.trim().length > 2 ||
				searchInput.value.trim().length === 0
			) {
				applySearch();
			}
		});
	}

	if (searchButton) {
		searchButton.addEventListener("click", applySearch);
	}

	(
		window as Window & {
			searchByAlternative?: (query: string, event: Event) => void;
		}
	).searchByAlternative = (alternativeQuery: string, event: Event) => {
		if (event) event.preventDefault();
		if (searchInput) {
			searchInput.value = alternativeQuery;
			applySearch();
		}
	};

	applySearch();
	if (searchInput) {
		searchInput.focus();
	}
}
