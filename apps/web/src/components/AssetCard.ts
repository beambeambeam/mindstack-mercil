import { trackRecommendationAction } from "../services/api";
import type { Asset, AssetType } from "../types/asset";
import { formatPrice } from "../utils/format";

export function renderAssetCards(
	properties: Asset[],
	assetTypes: AssetType[],
	container: HTMLElement,
): void {
	container.innerHTML = "";

	properties.forEach((property) => {
		const typeId = property.asset_type_id;
		const typeInfo =
			(typeId !== null && assetTypes.find((type) => type.id === typeId)) ||
			({ name_th: "อสังหาฯ อื่นๆ", name_en: "OTHER" } as AssetType);

		const cardClass =
			typeId !== null ? `asset-type-${typeId}` : "asset-type-other";
		const typeLabel = typeInfo.name_en
			? typeInfo.name_en.toUpperCase().split(" ")[0]
			: "OTHER";
		const typeName = typeInfo.name_th;

		const price = formatPrice(property.price);
		const detailURL = `/pages/detail/?id=${property.id}`;
		const name = property.name_th || "ไม่ระบุชื่อ";

		const cardHTML = `
      <div class="asset-card ${cardClass}">
        <div class="timer-tag">เหลือ 1D 5H 30M</div>

        <div class="card-image">
          <span class="type-label">${typeLabel}</span>
        </div>

        <div class="card-details">
          <div class="asset-type-label">${typeName}</div>
          <h3>${name}</h3>
          <p class="asset-code-text">รหัสทรัพย์: ${property.asset_code}</p>
          <p class="price-value">${price} บาท</p>

          <a href="${detailURL}" class="bid-button" data-asset-id="${property.id}">เข้าร่วมประมูล →</a>
        </div>
      </div>
    `;
		container.innerHTML += cardHTML;
	});

	container.querySelectorAll(".bid-button").forEach((button) => {
		button.addEventListener("click", (e) => {
			const assetIdAttr = (e.currentTarget as HTMLElement).getAttribute(
				"data-asset-id",
			);
			if (assetIdAttr) {
				const assetId = parseInt(assetIdAttr, 10);
				if (!Number.isNaN(assetId)) {
					trackRecommendationAction(assetId, "click").catch((error) => {
						console.error("Failed to track click:", error);
					});
				}
			}
		});
	});
}
