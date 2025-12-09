import inlineFilterStyles from "../styles/modules/inlineFilters.module.css";
import type { AssetType } from "../types/asset";

export interface FilterState {
	assetType: string;
	queryText?: string;
	priceMin?: number;
	priceMax?: number;
	bedroomsMin?: number;
	bathroomsMin?: number;
}

const FILTERED_ASSET_TYPE_IDS = [3, 4, 15, 1, 5];

export function createInlineFilters(
	container: HTMLElement,
	assetTypes: AssetType[],
	initialFilterState: FilterState,
	onSearch: (filterState: FilterState) => void,
): void {
	const filteredTypes = assetTypes
		.filter((type) => FILTERED_ASSET_TYPE_IDS.includes(type.id))
		.sort((a, b) => {
			const indexA = FILTERED_ASSET_TYPE_IDS.indexOf(a.id);
			const indexB = FILTERED_ASSET_TYPE_IDS.indexOf(b.id);
			return indexA - indexB;
		});

	const currentFilterState: FilterState = { ...initialFilterState };

	const filterForm = document.createElement("div");
	filterForm.className = inlineFilterStyles.filterForm;

	const queryTextSection = document.createElement("div");
	queryTextSection.className = inlineFilterStyles.filterSection;
	queryTextSection.style.gridColumn = "1 / -1";

	const queryTextLabel = document.createElement("label");
	queryTextLabel.className = inlineFilterStyles.filterLabel;
	queryTextLabel.textContent = "ค้นหาคำ";
	queryTextLabel.setAttribute("for", "inline-query-text");

	const queryTextInput = document.createElement("input");
	queryTextInput.type = "text";
	queryTextInput.id = "inline-query-text";
	queryTextInput.placeholder = "พิมพ์ชื่อโครงการ หรือรหัสทรัพย์...";
	queryTextInput.className = inlineFilterStyles.textInput;
	queryTextInput.value = currentFilterState.queryText || "";
	queryTextInput.addEventListener("input", () => {
		currentFilterState.queryText = queryTextInput.value.trim() || undefined;
	});

	queryTextSection.appendChild(queryTextLabel);
	queryTextSection.appendChild(queryTextInput);
	filterForm.appendChild(queryTextSection);

	const propertyTypeSection = document.createElement("div");
	propertyTypeSection.className = inlineFilterStyles.filterSection;
	propertyTypeSection.style.gridColumn = "1 / -1";

	const propertyTypeLabel = document.createElement("label");
	propertyTypeLabel.className = inlineFilterStyles.filterLabel;
	propertyTypeLabel.textContent = "ประเภททรัพย์สิน";

	const propertyTypeOptions = document.createElement("div");
	propertyTypeOptions.className = inlineFilterStyles.filterOptions;

	const allOption = document.createElement("button");
	allOption.type = "button";
	allOption.className = inlineFilterStyles.filterOption;
	if (currentFilterState.assetType === "all") {
		allOption.classList.add(inlineFilterStyles.filterOptionActive);
	}
	allOption.textContent = "ทั้งหมด";
	allOption.dataset.assetType = "all";
	allOption.addEventListener("click", () => {
		const allOptions = propertyTypeOptions.querySelectorAll(
			`.${inlineFilterStyles.filterOption}`,
		);
		for (const opt of allOptions) {
			opt.classList.remove(inlineFilterStyles.filterOptionActive);
		}
		allOption.classList.add(inlineFilterStyles.filterOptionActive);
		currentFilterState.assetType = "all";
	});
	propertyTypeOptions.appendChild(allOption);

	for (const type of filteredTypes) {
		const option = document.createElement("button");
		option.type = "button";
		option.className = inlineFilterStyles.filterOption;
		if (currentFilterState.assetType === String(type.id)) {
			option.classList.add(inlineFilterStyles.filterOptionActive);
		}
		option.textContent = type.name_th;
		option.dataset.assetType = String(type.id);
		option.addEventListener("click", () => {
			const allOptions = propertyTypeOptions.querySelectorAll(
				`.${inlineFilterStyles.filterOption}`,
			);
			for (const opt of allOptions) {
				opt.classList.remove(inlineFilterStyles.filterOptionActive);
			}
			option.classList.add(inlineFilterStyles.filterOptionActive);
			currentFilterState.assetType = String(type.id);
		});
		propertyTypeOptions.appendChild(option);
	}

	propertyTypeSection.appendChild(propertyTypeLabel);
	propertyTypeSection.appendChild(propertyTypeOptions);
	filterForm.appendChild(propertyTypeSection);

	const priceSection = document.createElement("div");
	priceSection.className = inlineFilterStyles.filterSection;

	const priceLabel = document.createElement("label");
	priceLabel.className = inlineFilterStyles.filterLabel;
	priceLabel.textContent = "ช่วงราคา";
	priceLabel.setAttribute("for", "inline-price-min");

	const priceInputs = document.createElement("div");
	priceInputs.className = inlineFilterStyles.priceInputs;

	const priceMinInput = document.createElement("input");
	priceMinInput.type = "number";
	priceMinInput.id = "inline-price-min";
	priceMinInput.placeholder = "ราคาขั้นต่ำ";
	priceMinInput.className = inlineFilterStyles.priceInput;
	priceMinInput.value = currentFilterState.priceMin?.toString() || "";
	priceMinInput.addEventListener("input", () => {
		currentFilterState.priceMin = priceMinInput.value
			? parseFloat(priceMinInput.value)
			: undefined;
	});

	const priceMaxInput = document.createElement("input");
	priceMaxInput.type = "number";
	priceMaxInput.placeholder = "ราคาสูงสุด";
	priceMaxInput.className = inlineFilterStyles.priceInput;
	priceMaxInput.value = currentFilterState.priceMax?.toString() || "";
	priceMaxInput.addEventListener("input", () => {
		currentFilterState.priceMax = priceMaxInput.value
			? parseFloat(priceMaxInput.value)
			: undefined;
	});

	priceInputs.appendChild(priceMinInput);
	priceInputs.appendChild(priceMaxInput);
	priceSection.appendChild(priceLabel);
	priceSection.appendChild(priceInputs);
	filterForm.appendChild(priceSection);

	const bedroomsSection = document.createElement("div");
	bedroomsSection.className = inlineFilterStyles.filterSection;

	const bedroomsLabel = document.createElement("label");
	bedroomsLabel.className = inlineFilterStyles.filterLabel;
	bedroomsLabel.textContent = "จำนวนห้องนอน";
	bedroomsLabel.setAttribute("for", "inline-bedrooms");

	const bedroomsInput = document.createElement("input");
	bedroomsInput.type = "number";
	bedroomsInput.id = "inline-bedrooms";
	bedroomsInput.placeholder = "ขั้นต่ำ";
	bedroomsInput.className = inlineFilterStyles.numberInput;
	bedroomsInput.min = "0";
	bedroomsInput.value = currentFilterState.bedroomsMin?.toString() || "";
	bedroomsInput.addEventListener("input", () => {
		currentFilterState.bedroomsMin = bedroomsInput.value
			? parseInt(bedroomsInput.value, 10)
			: undefined;
	});

	bedroomsSection.appendChild(bedroomsLabel);
	bedroomsSection.appendChild(bedroomsInput);
	filterForm.appendChild(bedroomsSection);

	const bathroomsSection = document.createElement("div");
	bathroomsSection.className = inlineFilterStyles.filterSection;

	const bathroomsLabel = document.createElement("label");
	bathroomsLabel.className = inlineFilterStyles.filterLabel;
	bathroomsLabel.textContent = "จำนวนห้องน้ำ";
	bathroomsLabel.setAttribute("for", "inline-bathrooms");

	const bathroomsInput = document.createElement("input");
	bathroomsInput.type = "number";
	bathroomsInput.id = "inline-bathrooms";
	bathroomsInput.placeholder = "ขั้นต่ำ";
	bathroomsInput.className = inlineFilterStyles.numberInput;
	bathroomsInput.min = "0";
	bathroomsInput.value = currentFilterState.bathroomsMin?.toString() || "";
	bathroomsInput.addEventListener("input", () => {
		currentFilterState.bathroomsMin = bathroomsInput.value
			? parseInt(bathroomsInput.value, 10)
			: undefined;
	});

	bathroomsSection.appendChild(bathroomsLabel);
	bathroomsSection.appendChild(bathroomsInput);
	filterForm.appendChild(bathroomsSection);

	const searchButtonSection = document.createElement("div");
	searchButtonSection.className = inlineFilterStyles.searchButtonSection;
	searchButtonSection.style.gridColumn = "1 / -1";

	const searchButton = document.createElement("button");
	searchButton.type = "button";
	searchButton.className = inlineFilterStyles.searchButton;
	searchButton.textContent = "ค้นหา";
	searchButton.addEventListener("click", () => {
		onSearch({ ...currentFilterState });
	});

	searchButtonSection.appendChild(searchButton);
	filterForm.appendChild(searchButtonSection);

	container.innerHTML = "";
	container.appendChild(filterForm);
}
