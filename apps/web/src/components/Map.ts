import L from "leaflet";
import type { Asset } from "../types/asset";
import "leaflet/dist/leaflet.css";

let mapInstance: L.Map | null = null;

export function initMap(
	containerId: string,
	lat: number,
	lng: number,
	zoom: number = 15,
	popupText?: string,
): L.Map {
	const mapElement = document.getElementById(containerId);
	if (!mapElement) {
		throw new Error(`Map container with ID "${containerId}" not found`);
	}

	if (mapInstance) {
		mapInstance.remove();
	}

	const map = L.map(containerId).setView([lat, lng], zoom);
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "© OpenStreetMap contributors",
	}).addTo(map);

	if (popupText) {
		L.marker([lat, lng]).addTo(map).bindPopup(popupText).openPopup();
	} else {
		L.marker([lat, lng]).addTo(map);
	}

	setTimeout(() => map.invalidateSize(), 100);

	mapInstance = map;
	return map;
}

export function initMapWithAssets(
	containerId: string,
	assets: Asset[],
): L.Map | null {
	const mapElement = document.getElementById(containerId);
	if (!mapElement) {
		console.error(`Map container with ID "${containerId}" not found`);
		return null;
	}

	if (mapInstance) {
		mapInstance.remove();
		mapInstance = null;
	}

	if (assets.length === 0) {
		return null;
	}

	const validAssets = assets.filter(
		(asset) =>
			asset.location_latitude !== null &&
			asset.location_longitude !== null &&
			!Number.isNaN(asset.location_latitude) &&
			!Number.isNaN(asset.location_longitude),
	);

	if (validAssets.length === 0) {
		const defaultLat = 13.736717;
		const defaultLng = 100.523186;
		const map = L.map(containerId).setView([defaultLat, defaultLng], 10);
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "© OpenStreetMap contributors",
		}).addTo(map);
		setTimeout(() => map.invalidateSize(), 100);
		mapInstance = map;
		return map;
	}

	const coordinates: [number, number][] = [];
	for (const asset of validAssets) {
		const lat = asset.location_latitude;
		const lng = asset.location_longitude;
		if (lat !== null && lng !== null) {
			coordinates.push([lat, lng]);
		}
	}
	const bounds = L.latLngBounds(coordinates);

	const map = L.map(containerId).fitBounds(bounds);
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "© OpenStreetMap contributors",
	}).addTo(map);

	validAssets.forEach((asset) => {
		const lat = asset.location_latitude;
		const lng = asset.location_longitude;
		if (lat === null || lng === null) {
			return;
		}
		const name = asset.name_th || "ไม่ระบุชื่อ";
		L.marker([lat, lng])
			.addTo(map)
			.bindPopup(`<strong>${name}</strong><br>${asset.asset_code}`);
	});

	setTimeout(() => map.invalidateSize(), 100);

	mapInstance = map;
	return map;
}

export function cleanupMap(): void {
	if (mapInstance) {
		mapInstance.remove();
		mapInstance = null;
	}
}
