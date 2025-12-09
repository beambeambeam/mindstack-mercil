import headerStyles from "../styles/modules/header.module.css";
import type { AssetType } from "../types/asset";

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

const FILTERED_ASSET_TYPE_IDS = [3, 4, 15, 1, 5];

export function renderFilterNavigation(
	assetTypes: AssetType[],
	onFilterChange: (assetType: string) => void,
): void {
	const filterNav = document.querySelector(".asset-filter-nav");
	if (!filterNav) return;

	const filteredTypes = assetTypes
		.filter((type) => FILTERED_ASSET_TYPE_IDS.includes(type.id))
		.sort((a, b) => {
			const indexA = FILTERED_ASSET_TYPE_IDS.indexOf(a.id);
			const indexB = FILTERED_ASSET_TYPE_IDS.indexOf(b.id);
			return indexA - indexB;
		});

	filterNav.innerHTML = `
		<a href="#" class="${headerStyles.navLink} ${headerStyles.active}" data-asset-type="all">ทั้งหมด</a>
		${filteredTypes
			.map(
				(type) =>
					`<a href="#" class="${headerStyles.navLink}" data-asset-type="${type.id}">${type.name_th}</a>`,
			)
			.join("")}
	`;

	const filterLinks = filterNav.querySelectorAll<HTMLAnchorElement>(
		`.${headerStyles.navLink}[data-asset-type]`,
	);
	filterLinks.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			for (const l of filterLinks) {
				l.classList.remove(headerStyles.active);
			}
			link.classList.add(headerStyles.active);

			const selectedType = link.getAttribute("data-asset-type");
			if (selectedType) {
				onFilterChange(selectedType);
			}
		});
	});
}

export function setupFilterNavigation(
	onFilterChange: (assetType: string) => void,
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
				onFilterChange(selectedType);
			}
		});
	});
}
