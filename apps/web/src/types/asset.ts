export interface AssetType {
	id: number;
	name_th: string;
	name_en?: string;
}

export interface Asset {
	id: number;
	asset_code: string;
	name_th: string | null;
	name_en: string | null;
	asset_type_id: number | null;
	price: number | null;
	bedrooms: number | null;
	bathrooms: number | null;
	description_th: string | null;
	description_en: string | null;
	location_latitude: number | null;
	location_longitude: number | null;
	images_main_id: number | null;
}

export interface AssetListResponse {
	items: Asset[];
	total: number;
}

export interface SearchFilter {
	query: string;
	price_max?: number;
	radius_km?: number;
	location_keyword?: string;
}

export interface SearchRequest {
	query_text: string;
	filters: {
		asset_type_id?: number[];
		price_min?: number;
		price_max?: number;
		bedrooms_min?: number;
	};
	pagination: {
		page: number;
		page_size: number;
	};
}

export interface AssetResult {
	id: number;
	asset_code: string;
	name_th: string | null;
	price: number | null;
	image_url: string;
	location_latitude: number | null;
	location_longitude: number | null;
}

export interface SearchResponse {
	results: AssetResult[];
	total_pages: number;
}
