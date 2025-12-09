import filterOverlayStyles from "../styles/modules/filterOverlay.module.css";
import headerStyles from "../styles/modules/header.module.css";
import type { AssetType } from "../types/asset";

export interface FilterState {
	assetType: string;
	queryText?: string;
	priceMin?: number;
	priceMax?: number;
	bedroomsMin?: number;
	bathroomsMin?: number;
}

let currentFilterState: FilterState = {
	assetType: "all",
};

let overlayElement: HTMLElement | null = null;
let filterPanelElement: HTMLElement | null = null;
let inputElement: HTMLInputElement | null = null;

const FILTERED_ASSET_TYPE_IDS = [3, 4, 15, 1, 5];

let onFilterChangeCallback: ((filterState: FilterState) => void) | null = null;
let assetTypesData: AssetType[] = [];

export function createFilterOverlay(
	assetTypes: AssetType[],
	onFilterChange: (filterState: FilterState) => void,
): void {
	assetTypesData = assetTypes;
	onFilterChangeCallback = onFilterChange;

	if (overlayElement) {
		return;
	}

	const filteredTypes = assetTypesData
		.filter((type) => FILTERED_ASSET_TYPE_IDS.includes(type.id))
		.sort((a, b) => {
			const indexA = FILTERED_ASSET_TYPE_IDS.indexOf(a.id);
			const indexB = FILTERED_ASSET_TYPE_IDS.indexOf(b.id);
			return indexA - indexB;
		});

	overlayElement = document.createElement("div");
	overlayElement.className = filterOverlayStyles.overlay;
	overlayElement.id = "filter-overlay";

	const filterPanel = document.createElement("div");
	filterPanel.className = filterOverlayStyles.filterPanel;
	filterPanelElement = filterPanel;

	const queryTextSection = document.createElement("div");
	queryTextSection.className = filterOverlayStyles.filterSection;

	const queryTextLabel = document.createElement("h3");
	queryTextLabel.className = filterOverlayStyles.filterLabel;
	queryTextLabel.textContent = "ค้นหาคำ";
	queryTextSection.appendChild(queryTextLabel);

	const queryTextInput = document.createElement("input");
	queryTextInput.type = "text";
	queryTextInput.placeholder = "พิมพ์ชื่อโครงการ หรือรหัสทรัพย์...";
	queryTextInput.className = filterOverlayStyles.textInput;
	queryTextInput.value = currentFilterState.queryText || "";
	queryTextInput.addEventListener("input", () => {
		currentFilterState.queryText = queryTextInput.value.trim() || undefined;
		updateSearchButtonVisibility();
	});

	queryTextSection.appendChild(queryTextInput);
	filterPanel.appendChild(queryTextSection);

	const propertyTypeSection = document.createElement("div");
	propertyTypeSection.className = filterOverlayStyles.filterSection;

	const propertyTypeLabel = document.createElement("h3");
	propertyTypeLabel.className = filterOverlayStyles.filterLabel;
	propertyTypeLabel.textContent = "ประเภททรัพย์สิน";
	propertyTypeSection.appendChild(propertyTypeLabel);

	const propertyTypeOptions = document.createElement("div");
	propertyTypeOptions.className = filterOverlayStyles.filterOptions;

	const allOption = createPropertyTypeOption(
		"all",
		"ทั้งหมด",
		currentFilterState.assetType === "all",
		filterPanel,
	);
	propertyTypeOptions.appendChild(allOption);

	filteredTypes.forEach((type) => {
		const option = createPropertyTypeOption(
			String(type.id),
			type.name_th,
			currentFilterState.assetType === String(type.id),
			filterPanel,
		);
		propertyTypeOptions.appendChild(option);
	});

	propertyTypeSection.appendChild(propertyTypeOptions);
	filterPanel.appendChild(propertyTypeSection);

	const priceSection = document.createElement("div");
	priceSection.className = filterOverlayStyles.filterSection;

	const priceLabel = document.createElement("h3");
	priceLabel.className = filterOverlayStyles.filterLabel;
	priceLabel.textContent = "ช่วงราคา";
	priceSection.appendChild(priceLabel);

	const priceInputs = document.createElement("div");
	priceInputs.className = filterOverlayStyles.priceInputs;

	const priceMinInput = document.createElement("input");
	priceMinInput.type = "number";
	priceMinInput.placeholder = "ราคาขั้นต่ำ";
	priceMinInput.className = filterOverlayStyles.priceInput;
	priceMinInput.value = currentFilterState.priceMin?.toString() || "";
	priceMinInput.addEventListener("input", () => {
		currentFilterState.priceMin = priceMinInput.value
			? parseFloat(priceMinInput.value)
			: undefined;
		if (onFilterChangeCallback) {
			onFilterChangeCallback(currentFilterState);
		}
		updateSearchButtonVisibility();
	});

	const priceMaxInput = document.createElement("input");
	priceMaxInput.type = "number";
	priceMaxInput.placeholder = "ราคาสูงสุด";
	priceMaxInput.className = filterOverlayStyles.priceInput;
	priceMaxInput.value = currentFilterState.priceMax?.toString() || "";
	priceMaxInput.addEventListener("input", () => {
		currentFilterState.priceMax = priceMaxInput.value
			? parseFloat(priceMaxInput.value)
			: undefined;
		if (onFilterChangeCallback) {
			onFilterChangeCallback(currentFilterState);
		}
		updateSearchButtonVisibility();
	});

	priceInputs.appendChild(priceMinInput);
	priceInputs.appendChild(priceMaxInput);
	priceSection.appendChild(priceInputs);
	filterPanel.appendChild(priceSection);

	const bedroomsSection = document.createElement("div");
	bedroomsSection.className = filterOverlayStyles.filterSection;

	const bedroomsLabel = document.createElement("h3");
	bedroomsLabel.className = filterOverlayStyles.filterLabel;
	bedroomsLabel.textContent = "จำนวนห้องนอน";
	bedroomsSection.appendChild(bedroomsLabel);

	const bedroomsInput = document.createElement("input");
	bedroomsInput.type = "number";
	bedroomsInput.placeholder = "ขั้นต่ำ";
	bedroomsInput.className = filterOverlayStyles.numberInput;
	bedroomsInput.min = "0";
	bedroomsInput.value = currentFilterState.bedroomsMin?.toString() || "";
	bedroomsInput.addEventListener("input", () => {
		currentFilterState.bedroomsMin = bedroomsInput.value
			? parseInt(bedroomsInput.value, 10)
			: undefined;
		if (onFilterChangeCallback) {
			onFilterChangeCallback(currentFilterState);
		}
		updateSearchButtonVisibility();
	});

	bedroomsSection.appendChild(bedroomsInput);
	filterPanel.appendChild(bedroomsSection);

	const bathroomsSection = document.createElement("div");
	bathroomsSection.className = filterOverlayStyles.filterSection;

	const bathroomsLabel = document.createElement("h3");
	bathroomsLabel.className = filterOverlayStyles.filterLabel;
	bathroomsLabel.textContent = "จำนวนห้องน้ำ";
	bathroomsSection.appendChild(bathroomsLabel);

	const bathroomsInput = document.createElement("input");
	bathroomsInput.type = "number";
	bathroomsInput.placeholder = "ขั้นต่ำ";
	bathroomsInput.className = filterOverlayStyles.numberInput;
	bathroomsInput.min = "0";
	bathroomsInput.value = currentFilterState.bathroomsMin?.toString() || "";
	bathroomsInput.addEventListener("input", () => {
		currentFilterState.bathroomsMin = bathroomsInput.value
			? parseInt(bathroomsInput.value, 10)
			: undefined;
		if (onFilterChangeCallback) {
			onFilterChangeCallback(currentFilterState);
		}
	});

	bathroomsSection.appendChild(bathroomsInput);
	filterPanel.appendChild(bathroomsSection);

	const searchButtonContainer = document.createElement("div");
	searchButtonContainer.style.display = "flex";
	searchButtonContainer.style.justifyContent = "flex-end";
	searchButtonContainer.style.marginTop = "30px";
	searchButtonContainer.style.paddingTop = "20px";
	searchButtonContainer.style.borderTop = "1px solid #eee";

	const searchButton = document.createElement("button");
	searchButton.type = "button";
	searchButton.className = filterOverlayStyles.searchButton;
	searchButton.textContent = "ค้นหา";
	searchButton.addEventListener("click", () => {
		navigateToSearch();
	});

	updateSearchButtonVisibility(searchButton);

	searchButtonContainer.appendChild(searchButton);
	filterPanel.appendChild(searchButtonContainer);

	overlayElement.appendChild(filterPanel);
	document.body.appendChild(overlayElement);

	overlayElement.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
		if (target === overlayElement || !filterPanel.contains(target)) {
			closeFilterOverlay();
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && isOverlayOpen()) {
			closeFilterOverlay();
		}
	});
}

function createPropertyTypeOption(
	value: string,
	label: string,
	isSelected: boolean,
	filterPanel: HTMLElement,
): HTMLElement {
	const option = document.createElement("button");
	option.type = "button";
	option.className = filterOverlayStyles.filterOption;
	if (isSelected) {
		option.classList.add(filterOverlayStyles.filterOptionActive);
	}
	option.textContent = label;
	option.dataset.assetType = value;

	option.addEventListener("click", () => {
		const allOptions = filterPanel.querySelectorAll(
			`.${filterOverlayStyles.filterOption}`,
		);
		allOptions.forEach((opt) => {
			opt.classList.remove(filterOverlayStyles.filterOptionActive);
		});
		option.classList.add(filterOverlayStyles.filterOptionActive);

		currentFilterState.assetType = value;
		updateInputDisplay();
		updateSearchButtonVisibility();
	});

	return option;
}

export function openFilterOverlay(): void {
	if (!overlayElement) {
		if (assetTypesData.length > 0 && onFilterChangeCallback) {
			createFilterOverlay(assetTypesData, onFilterChangeCallback);
		} else {
			return;
		}
	}
	if (!overlayElement) return;

	overlayElement.classList.add(filterOverlayStyles.overlayVisible);
	document.body.style.overflow = "hidden";

	if (inputElement) {
		inputElement.classList.add(headerStyles.inputHighlighted);
		inputElement.focus();
	}

	updateSearchButtonVisibility();
}

export function closeFilterOverlay(): void {
	if (!overlayElement) return;
	overlayElement.classList.remove(filterOverlayStyles.overlayVisible);
	document.body.style.overflow = "";
	if (inputElement) {
		inputElement.classList.remove(headerStyles.inputHighlighted);
	}
}

export function isOverlayOpen(): boolean {
	return (
		overlayElement?.classList.contains(filterOverlayStyles.overlayVisible) ||
		false
	);
}

export function setInputElement(element: HTMLInputElement): void {
	inputElement = element;
}

export function updateInputDisplay(): void {
	if (!inputElement) return;

	const selectedType = currentFilterState.assetType;
	if (selectedType === "all") {
		inputElement.value = "ทั้งหมด";
	} else {
		const filterPanel = document.querySelector(
			`.${filterOverlayStyles.filterPanel}`,
		);
		if (filterPanel) {
			const selectedOption = filterPanel.querySelector(
				`.${filterOverlayStyles.filterOptionActive}`,
			);
			if (selectedOption) {
				inputElement.value = selectedOption.textContent || "ทั้งหมด";
			}
		}
	}
}

export function getCurrentFilterState(): FilterState {
	return { ...currentFilterState };
}

export function setFilterState(state: FilterState): void {
	currentFilterState = { ...state };
	updateInputDisplay();
}

export function setAssetType(assetType: string): void {
	currentFilterState.assetType = assetType;
	updateInputDisplay();

	if (overlayElement && filterPanelElement) {
		const allOptions = filterPanelElement.querySelectorAll(
			`.${filterOverlayStyles.filterOption}`,
		);
		allOptions.forEach((opt) => {
			opt.classList.remove(filterOverlayStyles.filterOptionActive);
			if (opt.getAttribute("data-asset-type") === assetType) {
				opt.classList.add(filterOverlayStyles.filterOptionActive);
			}
		});
	}

	updateSearchButtonVisibility();
}

function updateSearchButtonVisibility(button?: HTMLButtonElement): void {
	const searchBtn =
		button ||
		(filterPanelElement?.querySelector(
			`.${filterOverlayStyles.searchButton}`,
		) as HTMLButtonElement);
	if (!searchBtn) return;
	searchBtn.style.display = "block";
}

function navigateToSearch(): void {
	const params = new URLSearchParams();

	if (
		currentFilterState.queryText !== undefined &&
		currentFilterState.queryText.trim() !== ""
	) {
		params.append("query_text", currentFilterState.queryText.trim());
	}

	if (currentFilterState.assetType !== "all") {
		const assetTypeId = parseInt(currentFilterState.assetType, 10);
		if (!Number.isNaN(assetTypeId)) {
			params.append("asset_type_id", String(assetTypeId));
		}
	}

	if (currentFilterState.priceMin !== undefined) {
		params.append("price_min", String(currentFilterState.priceMin));
	}

	if (currentFilterState.priceMax !== undefined) {
		params.append("price_max", String(currentFilterState.priceMax));
	}

	if (currentFilterState.bedroomsMin !== undefined) {
		params.append("bedrooms_min", String(currentFilterState.bedroomsMin));
	}

	const queryString = params.toString();
	const searchUrl = queryString
		? `/pages/search/?${queryString}`
		: "/pages/search/";

	window.location.href = searchUrl;
}
