import { renderAssetCards } from "../../src/components/AssetCard";
import {
	createInlineFilters,
	type FilterState,
} from "../../src/components/InlineFilters";
import {
	getAllAssets,
	getAssetTypes,
	searchAssetsGET,
} from "../../src/services/api";
import searchStyles from "../../src/styles/modules/search.module.css";
import type { Asset, AssetType } from "../../src/types/asset";
import { extractAssetTypes } from "../../src/utils/format";
import "./index.css";

let allAssets: Asset[] = [];
let assetTypes: AssetType[] = [];
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

	const newUrl = `/search/?${params.toString()}`;
	window.location.href = newUrl;
}

function buildSearchURL(filterState: FilterState): string {
	const params = new URLSearchParams();

	if (filterState.queryText && filterState.queryText.trim() !== "") {
		params.append("query_text", filterState.queryText.trim());
	}

	if (filterState.assetType !== "all") {
		const assetTypeId = parseInt(filterState.assetType, 10);
		if (!Number.isNaN(assetTypeId)) {
			params.append("asset_type_id", String(assetTypeId));
		}
	}

	if (filterState.priceMin !== undefined) {
		params.append("price_min", String(filterState.priceMin));
	}

	if (filterState.priceMax !== undefined) {
		params.append("price_max", String(filterState.priceMax));
	}

	if (filterState.bedroomsMin !== undefined) {
		params.append("bedrooms_min", String(filterState.bedroomsMin));
	}

	const queryString = params.toString();
	return queryString ? `/search/?${queryString}` : "/search";
}

function urlParamsToFilterState(
	urlParams: ReturnType<typeof getURLSearchParams>,
): FilterState {
	return {
		queryText: urlParams.query_text,
		assetType: urlParams.asset_type_id
			? String(urlParams.asset_type_id)
			: "all",
		priceMin: urlParams.price_min,
		priceMax: urlParams.price_max,
		bedroomsMin: urlParams.bedrooms_min,
	};
}

export function init() {
	console.log("Search page initialized");

	const inlineFiltersContainer = document.getElementById(
		"inline-filters-container",
	);
	const urlParams = getURLSearchParams();

	if (inlineFiltersContainer) {
		getAssetTypes()
			.then((types) => {
				const initialFilterState = urlParamsToFilterState(urlParams);
				createInlineFilters(
					inlineFiltersContainer,
					types,
					initialFilterState,
					(filterState: FilterState) => {
						const searchUrl = buildSearchURL(filterState);
						window.location.href = searchUrl;
					},
				);
			})
			.catch((error) => {
				console.error("Error loading asset types for inline filters:", error);
			});
	}

	applySearch();
}
