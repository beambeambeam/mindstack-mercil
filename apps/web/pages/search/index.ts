import { renderAssetCards } from "../../src/components/AssetCard";
import {
	getAllAssets,
	getAssetTypes,
	searchAssetsGET,
} from "../../src/services/api";
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
let currentPage = 1;
let totalPages = 1;

function getURLSearchParams(): {
	query_text?: string;
	asset_type_id?: number;
	price_min?: number;
	price_max?: number;
	bedrooms_min?: number;
	page: number;
	page_size: number;
} {
	const params = new URLSearchParams(window.location.search);

	const queryText = params.get("query_text");
	const assetTypeId = params.get("asset_type_id");
	const priceMin = params.get("price_min");
	const priceMax = params.get("price_max");
	const bedroomsMin = params.get("bedrooms_min");
	const page = params.get("page");
	const pageSize = params.get("page_size");

	return {
		query_text: queryText || undefined,
		asset_type_id: assetTypeId ? parseInt(assetTypeId, 10) : undefined,
		price_min: priceMin ? parseInt(priceMin, 10) : undefined,
		price_max: priceMax ? parseInt(priceMax, 10) : undefined,
		bedrooms_min: bedroomsMin ? parseInt(bedroomsMin, 10) : undefined,
		page: page ? parseInt(page, 10) : 1,
		page_size: pageSize ? parseInt(pageSize, 10) : 20,
	};
}

async function applySearch() {
	const searchInput = document.getElementById(
		"search-input",
	) as HTMLInputElement;
	const searchTerm = searchInput ? searchInput.value.trim() : "";
	const container = document.getElementById("asset-card-container");
	const paginationContainer = document.getElementById("pagination-container");

	if (!container) {
		console.error("Asset card container not found.");
		return;
	}

	const urlParams = getURLSearchParams();
	const hasURLParams =
		(urlParams.query_text !== undefined &&
			urlParams.query_text.trim() !== "") ||
		urlParams.asset_type_id !== undefined ||
		urlParams.price_min !== undefined ||
		urlParams.price_max !== undefined ||
		urlParams.bedrooms_min !== undefined;

	currentPage = urlParams.page;
	const pageSize = urlParams.page_size;

	try {
		const typesResponse = await getAssetTypes();
		assetTypes = typesResponse;
	} catch (error) {
		console.error("Error loading asset types:", error);
	}

	if (hasURLParams) {
		container.innerHTML = `<p class="${searchStyles.loadingMessage}">กำลังค้นหาทรัพย์สิน...</p>`;

		try {
			const searchResponse = await searchAssetsGET({
				query_text: urlParams.query_text,
				asset_type_id: urlParams.asset_type_id,
				price_min: urlParams.price_min,
				price_max: urlParams.price_max,
				bedrooms_min: urlParams.bedrooms_min,
				page: currentPage,
				page_size: pageSize,
			});

			totalPages = searchResponse.total_pages;

			const assetCodes = searchResponse.results.map((r) => r.asset_code);
			const allAssetsResponse = await getAllAssets(1, 200);
			allAssets = allAssetsResponse.items.filter((asset) =>
				assetCodes.includes(asset.asset_code),
			);

			const assetTypesForDisplay = extractAssetTypes(allAssets);

			if (allAssets.length === 0) {
				container.innerHTML = `<p class="${searchStyles.noResultsMessage}">ไม่พบผลลัพธ์ที่ตรงกับเงื่อนไขการค้นหา</p>`;
				if (paginationContainer) {
					paginationContainer.innerHTML = "";
				}
			} else {
				renderAssetCards(allAssets, assetTypesForDisplay, container);
				renderPagination(paginationContainer);
			}
		} catch (error) {
			console.error("Error searching assets:", error);
			container.innerHTML = `<p class="${searchStyles.noResultsMessage}">เกิดข้อผิดพลาดในการค้นหา</p>`;
			if (paginationContainer) {
				paginationContainer.innerHTML = "";
			}
		}
		return;
	}

	if (!searchTerm) {
		try {
			const assetsResponse = await getAllAssets(currentPage, pageSize);
			allAssets = assetsResponse.items;
			const assetTypesForDisplay = extractAssetTypes(allAssets);
			renderAssetCards(allAssets, assetTypesForDisplay, container);
			if (paginationContainer) {
				paginationContainer.innerHTML = "";
			}
		} catch (error) {
			console.error("Error loading assets:", error);
		}
		return;
	}

	container.innerHTML = `<p class="${searchStyles.loadingMessage}">กำลังค้นหาทรัพย์สินอัจฉริยะ...</p>`;

	latestParsedFilters = getParsedFilters(searchTerm);

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
		if (paginationContainer) {
			paginationContainer.innerHTML = "";
		}
	} else {
		const assetTypesForDisplay = extractAssetTypes(allAssets);
		renderAssetCards(results, assetTypesForDisplay, container);
		if (paginationContainer) {
			paginationContainer.innerHTML = "";
		}
	}
}

function renderPagination(container: HTMLElement | null): void {
	if (!container || totalPages <= 1) {
		if (container) {
			container.innerHTML = "";
		}
		return;
	}

	const paginationHTML = document.createElement("div");
	paginationHTML.className = searchStyles.paginationContainer;

	const prevButton = document.createElement("button");
	prevButton.className = searchStyles.paginationButton;
	prevButton.textContent = "← ก่อนหน้า";
	prevButton.disabled = currentPage === 1;
	prevButton.addEventListener("click", () => {
		if (currentPage > 1) {
			navigateToPage(currentPage - 1);
		}
	});
	paginationHTML.appendChild(prevButton);

	const pageNumbers = document.createElement("div");
	pageNumbers.className = searchStyles.pageNumbers;

	const maxVisiblePages = 5;
	let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
	const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

	if (endPage - startPage < maxVisiblePages - 1) {
		startPage = Math.max(1, endPage - maxVisiblePages + 1);
	}

	if (startPage > 1) {
		const firstButton = document.createElement("button");
		firstButton.className = searchStyles.pageButton;
		firstButton.textContent = "1";
		firstButton.addEventListener("click", () => navigateToPage(1));
		pageNumbers.appendChild(firstButton);

		if (startPage > 2) {
			const ellipsis = document.createElement("span");
			ellipsis.className = searchStyles.pageEllipsis;
			ellipsis.textContent = "...";
			pageNumbers.appendChild(ellipsis);
		}
	}

	for (let i = startPage; i <= endPage; i++) {
		const pageButton = document.createElement("button");
		pageButton.className = searchStyles.pageButton;
		if (i === currentPage) {
			pageButton.classList.add(searchStyles.pageButtonActive);
		}
		pageButton.textContent = String(i);
		pageButton.addEventListener("click", () => navigateToPage(i));
		pageNumbers.appendChild(pageButton);
	}

	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			const ellipsis = document.createElement("span");
			ellipsis.className = searchStyles.pageEllipsis;
			ellipsis.textContent = "...";
			pageNumbers.appendChild(ellipsis);
		}

		const lastButton = document.createElement("button");
		lastButton.className = searchStyles.pageButton;
		lastButton.textContent = String(totalPages);
		lastButton.addEventListener("click", () => navigateToPage(totalPages));
		pageNumbers.appendChild(lastButton);
	}

	paginationHTML.appendChild(pageNumbers);

	const nextButton = document.createElement("button");
	nextButton.className = searchStyles.paginationButton;
	nextButton.textContent = "ถัดไป →";
	nextButton.disabled = currentPage === totalPages;
	nextButton.addEventListener("click", () => {
		if (currentPage < totalPages) {
			navigateToPage(currentPage + 1);
		}
	});
	paginationHTML.appendChild(nextButton);

	container.innerHTML = "";
	container.appendChild(paginationHTML);
}

function navigateToPage(page: number): void {
	const urlParams = getURLSearchParams();
	const params = new URLSearchParams(window.location.search);

	params.set("page", String(page));

	const newUrl = `/pages/search/?${params.toString()}`;
	window.location.href = newUrl;
}

export function init() {
	console.log("Search page initialized");

	const searchInput = document.getElementById(
		"search-input",
	) as HTMLInputElement;
	const searchButton = document.getElementById("search-button");

	const urlParams = getURLSearchParams();
	if (searchInput && urlParams.query_text) {
		searchInput.value = urlParams.query_text;
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
