import headerStyles from "../styles/modules/header.module.css";
import type { AssetType } from "../types/asset";
import {
	createFilterOverlay,
	type FilterState,
	openFilterOverlay,
	setInputElement,
	updateInputDisplay,
} from "./FilterOverlay";

export function initHeader(): void {
	const filterLinks = document.querySelectorAll<HTMLAnchorElement>(
		".asset-filter-nav .nav-link",
	);
	filterLinks.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			for (const l of filterLinks) {
				l.classList.remove("active");
			}
			link.classList.add("active");
		});
	});
}

export function renderFilterNavigation(
	assetTypes: AssetType[],
	onFilterChange: (filterState: FilterState) => void,
): void {
	const filterNav = document.querySelector(".asset-filter-nav");
	if (!filterNav) return;

	const input = document.createElement("input");
	input.type = "text";
	input.className = headerStyles.filterInput;
	input.value = "ค้นหาสินทรัพย์ และ อื่นๆ";
	input.readOnly = true;
	input.placeholder = "เลือกประเภททรัพย์สิน";

	setInputElement(input);

	filterNav.innerHTML = "";
	filterNav.appendChild(input);

	input.addEventListener("click", () => {
		createFilterOverlay(assetTypes, onFilterChange);
		openFilterOverlay();
	});

	input.addEventListener("focus", () => {
		createFilterOverlay(assetTypes, onFilterChange);
		openFilterOverlay();
	});

	createFilterOverlay(assetTypes, onFilterChange);
	updateInputDisplay();
}

export function setupFilterNavigation(
	onFilterChange: (filterState: FilterState) => void,
): void {
	const filterLinks = document.querySelectorAll<HTMLAnchorElement>(
		".asset-filter-nav .nav-link[data-asset-type]",
	);
	filterLinks.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			for (const l of filterLinks) {
				l.classList.remove("active");
			}
			link.classList.add("active");

			const selectedType = link.getAttribute("data-asset-type");
			if (selectedType) {
				onFilterChange({ assetType: selectedType });
			}
		});
	});
}
