import { renderAssetCards } from "../components/AssetCard";
import { getAllAssets, getAssetTypes } from "../services/api";
import { getParsedFilters, hybridSearchAPI } from "../services/search";
import type { Asset, AssetType } from "../types/asset";
import { extractAssetTypes, formatPrice } from "../utils/format";

let allAssets: Asset[] = [];
let assetTypes: AssetType[] = [];
let latestParsedFilters: ReturnType<typeof getParsedFilters> = {
	query: "",
};

async function loadInitialData(): Promise<void> {
	try {
		const [assetsResponse, typesResponse] = await Promise.all([
			getAllAssets(1, 200),
			getAssetTypes(),
		]);
		allAssets = assetsResponse.items;
		assetTypes = typesResponse;
	} catch (error) {
		console.error("Error loading initial assets:", error);
	}
}

async function applySearch(): Promise<void> {
	const searchInput = document.getElementById(
		"search-input",
	) as HTMLInputElement;
	const searchTerm = searchInput ? searchInput.value.trim() : "";
	const container = document.getElementById("asset-card-container");

	if (!container) return;

	if (!searchTerm) {
		const assetTypesForDisplay = extractAssetTypes(allAssets);
		renderAssetCards(allAssets, assetTypesForDisplay, container);
		return;
	}

	latestParsedFilters = getParsedFilters(searchTerm);

	container.innerHTML =
		'<p style="text-align: center; grid-column: 1 / -1; padding: 50px; font-size: 1.2em; color: #1d7874;">กำลังค้นหาทรัพย์สินอัจฉริยะ...</p>';

	try {
		const results = await hybridSearchAPI(searchTerm);

		if (results.length === 0) {
			let zeroResultHTML = `<p style="text-align: center; grid-column: 1 / -1; padding: 30px; font-size: 1.2em; color: #d64545;">ไม่พบผลลัพธ์ที่เกี่ยวข้องกับ "${searchTerm}"</p>`;

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
          <div style="text-align: center; grid-column: 1 / -1; margin-top: 20px; padding: 20px; background: #fff;">
            <h3 style="color: #1a4f6d;">💡 ข้อเสนอแนะทางเลือก:</h3>
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
	} catch (error) {
		console.error("Search error:", error);
		container.innerHTML =
			'<p style="text-align: center; grid-column: 1 / -1; padding: 30px; font-size: 1.2em; color: #d64545;">เกิดข้อผิดพลาดในการค้นหา</p>';
	}
}

(window as unknown as { searchByAlternative: unknown }).searchByAlternative = (
	alternativeQuery: string,
	event: Event,
) => {
	if (event) event.preventDefault();
	const searchInput = document.getElementById(
		"search-input",
	) as HTMLInputElement;
	if (searchInput) {
		searchInput.value = alternativeQuery;
		applySearch();
	}
};

export async function init(): Promise<void> {
	await loadInitialData();

	const searchInput = document.getElementById(
		"search-input",
	) as HTMLInputElement;
	const searchButton = document.getElementById("search-button");
	const container = document.getElementById("asset-card-container");

	if (container) {
		container.innerHTML =
			'<p style="text-align: center; grid-column: 1 / -1; padding: 50px; font-size: 1.2em; color: #777;">พิมพ์คำค้นหาเพื่อเริ่ม</p>';
	}

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

	if (searchInput) {
		searchInput.focus();
	}
}
