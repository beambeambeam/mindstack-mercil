import type { SearchFilter } from "../types/asset";

export function parseQueryForFilters(query: string): SearchFilter {
	const filters: SearchFilter = {
		query: query,
		price_max: undefined,
		radius_km: undefined,
		location_keyword: undefined,
	};

	let remainingQuery = query;

	const priceMatch = query.match(
		/(under|ต่ำกว่า|ไม่เกิน)\s*([\d.]+[MK]{0,1})\s*บาท?/i,
	);
	if (priceMatch) {
		const rawPrice = priceMatch[2];
		let priceValue = parseFloat(rawPrice);
		if (rawPrice.toUpperCase().includes("M")) {
			priceValue *= 1000000;
		} else if (rawPrice.toUpperCase().includes("K")) {
			priceValue *= 1000;
		}
		filters.price_max = priceValue;
		remainingQuery = remainingQuery.replace(priceMatch[0], "").trim();
	}

	const radiusLocationMatch = remainingQuery.match(
		/(within|รัศมี|ในระยะ)\s*(\d+)\s*km\s*(of|จาก)\s*(.+)/i,
	);
	if (radiusLocationMatch) {
		filters.radius_km = parseFloat(radiusLocationMatch[2]);
		filters.location_keyword = radiusLocationMatch[4].trim();
		remainingQuery = remainingQuery.replace(radiusLocationMatch[0], "").trim();
	}

	filters.query = remainingQuery;

	return filters;
}
