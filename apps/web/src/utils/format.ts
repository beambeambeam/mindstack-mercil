import type { Asset, AssetType } from "../types/asset";

export function formatPrice(price: number | string | null | undefined): string {
	if (price === null || price === undefined) return "N/A";
	const numPrice = typeof price === "string" ? parseFloat(price) : price;
	if (Number.isNaN(numPrice)) return "N/A";
	return new Intl.NumberFormat("th-TH", {
		style: "decimal",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(numPrice);
}

export function getAssetTypeById(
	assetTypes: AssetType[],
	id: number | null,
): string {
	if (id === null) return "ไม่ระบุ";
	const type = assetTypes.find((t) => t.id === id);
	return type ? type.name_th : "ไม่ระบุ";
}

export function extractAssetTypes(assets: Asset[]): AssetType[] {
	const typeMap = new Map<number, AssetType>();
	assets.forEach((asset) => {
		if (
			asset.asset_type_id !== null &&
			asset.name_th &&
			!typeMap.has(asset.asset_type_id)
		) {
			typeMap.set(asset.asset_type_id, {
				id: asset.asset_type_id,
				name_th: asset.name_th,
				name_en: asset.name_en || undefined,
			});
		}
	});
	return Array.from(typeMap.values());
}
