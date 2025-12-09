import { renderAssetCards } from "../../src/components/AssetCard";
import { initMap } from "../../src/components/Map";
import { getAllAssets } from "../../src/services/api";
import headerStyles from "../../src/styles/modules/header.module.css";
import type { Asset, AssetType } from "../../src/types/asset";
import "./index.css";

let allAssets: Asset[] = [];
let assetTypes: AssetType[] = [];

const dummyAssetTypes: AssetType[] = [
	{ id: 1, name_th: "ทาวน์เฮ้าส์", name_en: "TOWNHOUSE" },
	{ id: 2, name_th: "ที่ดินเปล่า", name_en: "LAND" },
	{ id: 3, name_th: "ห้องชุดพักอาศัย", name_en: "CONDOMINIUM" },
	{ id: 4, name_th: "บ้านเดี่ยว", name_en: "DETACHED HOUSE" },
	{ id: 5, name_th: "อาคารพาณิชย์", name_en: "COMMERCIAL BUILDING" },
	{ id: 15, name_th: "บ้านแฝด", name_en: "SEMI-DETACHED HOUSE" },
];

export async function init() {
	console.log("Index page initialized");

	const response = await getAllAssets(1, 200);
	allAssets = response.items;
	assetTypes = dummyAssetTypes;

	const container = document.getElementById("asset-card-container");
	if (container) {
		renderAssetCards(allAssets, assetTypes, container);
	}

	initMap("map", allAssets, 10);

	const filterNav = document.querySelector(`.${headerStyles.assetFilterNav}`);
	if (filterNav) {
		filterNav.innerHTML = `
      <a href="#" class="${headerStyles.navLink} ${headerStyles.active}" data-asset-type="all">ทั้งหมด</a>
      ${assetTypes
				.map(
					(type) =>
						`<a href="#" class="${headerStyles.navLink}" data-asset-type="${type.id}">${type.name_th}</a>`,
				)
				.join("")}
    `;

		const filterLinks = filterNav.querySelectorAll(`.${headerStyles.navLink}`);
		filterLinks.forEach((link) => {
			link.addEventListener("click", (e) => {
				e.preventDefault();

				for (const l of filterLinks) {
					l.classList.remove(headerStyles.active);
				}
				(e.target as HTMLElement).classList.add(headerStyles.active);

				const selectedType = (e.target as HTMLElement).getAttribute(
					"data-asset-type",
				);

				let filteredList: Asset[] = [];
				if (selectedType === "all") {
					filteredList = allAssets;
				} else {
					const typeId = parseInt(selectedType || "0", 10);
					filteredList = allAssets.filter((p) => p.asset_type_id === typeId);
				}

				if (container) {
					renderAssetCards(filteredList, assetTypes, container);
				}
				initMap("map", filteredList, 10);
			});
		});
	}
}
