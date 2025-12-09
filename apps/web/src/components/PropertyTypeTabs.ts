import type { AssetType } from "../types/asset";

const FILTERED_ASSET_TYPE_IDS = [3, 4, 15, 1, 5];

export function createPropertyTypeTabs(
	assetTypes: AssetType[],
	onTypeChange: (assetType: string) => void,
): void {
	const titleElement = document.querySelector(".content-container h1");
	if (!titleElement) return;

	const filteredTypes = assetTypes
		.filter((type) => FILTERED_ASSET_TYPE_IDS.includes(type.id))
		.sort((a, b) => {
			const indexA = FILTERED_ASSET_TYPE_IDS.indexOf(a.id);
			const indexB = FILTERED_ASSET_TYPE_IDS.indexOf(b.id);
			return indexA - indexB;
		});

	let tabsContainer = document.getElementById("property-type-tabs");
	if (!tabsContainer) {
		tabsContainer = document.createElement("div");
		tabsContainer.id = "property-type-tabs";
		tabsContainer.className = "property-type-tabs";
		titleElement.insertAdjacentElement("afterend", tabsContainer);
	}

	tabsContainer.innerHTML = `
		<button class="property-type-tab active" data-asset-type="all">ทั้งหมด</button>
		${filteredTypes
			.map(
				(type) =>
					`<button class="property-type-tab" data-asset-type="${type.id}">${type.name_th}</button>`,
			)
			.join("")}
	`;

	const tabs =
		tabsContainer.querySelectorAll<HTMLButtonElement>(".property-type-tab");
	tabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			for (const t of tabs) {
				t.classList.remove("active");
			}
			tab.classList.add("active");

			const selectedType = tab.getAttribute("data-asset-type");
			if (selectedType) {
				onTypeChange(selectedType);
			}
		});
	});
}
