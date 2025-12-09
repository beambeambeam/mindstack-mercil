import { initMap } from "../../src/components/Map";
import { getAssetById } from "../../src/services/api";
import detailStyles from "../../src/styles/modules/detail.module.css";
import type { Asset } from "../../src/types/asset";
import { formatPrice } from "../../src/utils/format";
import "./index.css";

function getUrlParameter(name: string): string {
	name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
	const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
	const results = regex.exec(location.search);
	return results === null
		? ""
		: decodeURIComponent(results[1].replace(/\+/g, " "));
}

async function loadAssetDetails() {
	const assetId = parseInt(getUrlParameter("id"), 10);

	const detailNameEl = document.getElementById("asset-detail-name");
	if (Number.isNaN(assetId)) {
		if (detailNameEl) {
			detailNameEl.innerText = "ไม่พบรหัสทรัพย์สิน";
		}
		return;
	}

	const selectedAsset: Asset | null = await getAssetById(assetId);

	if (!selectedAsset) {
		if (detailNameEl) {
			detailNameEl.innerText = "ไม่พบทรัพย์สินนี้";
		}
		return;
	}

	const titleEl = document.getElementById("asset-title");
	if (titleEl) {
		titleEl.innerText = selectedAsset.name_th || "รายละเอียดทรัพย์สิน";
	}
	if (detailNameEl) {
		detailNameEl.innerText = selectedAsset.name_th || "ไม่ระบุชื่อ";
	}
	const detailCodeEl = document.getElementById("asset-detail-code");
	if (detailCodeEl) {
		detailCodeEl.innerText = `รหัสทรัพย์: ${selectedAsset.asset_code}`;
	}

	const priceFormatted = formatPrice(selectedAsset.price);
	const startingPriceEl = document.getElementById("starting-price");
	if (startingPriceEl) {
		startingPriceEl.innerText = `${priceFormatted} บาท`;
	}
	const currentPriceEl = document.getElementById("current-price");
	if (currentPriceEl) {
		currentPriceEl.innerText = `${priceFormatted} บาท (ราคาเริ่มต้น)`;
	}
	const closingTimeEl = document.getElementById("closing-time");
	if (closingTimeEl) {
		closingTimeEl.innerText = "25 พ.ย. 2568 เวลา 14:00 น.";
	}
	const descriptionEl = document.getElementById("asset-description");
	if (descriptionEl) {
		descriptionEl.innerText =
			selectedAsset.description_th?.replace(/\r\n/g, "\n") || "ไม่มีรายละเอียด";
	}

	const areaSizeEl = document.getElementById("area-size");
	if (areaSizeEl) {
		areaSizeEl.innerText = "N/A";
	}
	const numBedEl = document.getElementById("num-bed");
	if (numBedEl) {
		numBedEl.innerText = selectedAsset.bedrooms?.toString() || "N/A";
	}
	const numBathEl = document.getElementById("num-bath");
	if (numBathEl) {
		numBathEl.innerText = selectedAsset.bathrooms?.toString() || "N/A";
	}

	const lat = selectedAsset.location_latitude;
	const lng = selectedAsset.location_longitude;

	if (lat && lng) {
		initMap("mini-map", [selectedAsset], 15);
	} else {
		const miniMapEl = document.getElementById("mini-map");
		if (miniMapEl) {
			miniMapEl.innerHTML = `<p class="${detailStyles.noMapMessage}">ไม่พบพิกัดทรัพย์สินนี้</p>`;
		}
	}

	const countdownElement = document.getElementById("live-timer");
	if (countdownElement) {
		let secondsLeft = 1 * 24 * 60 * 60 + 5 * 3600 + 30 * 60;
		const interval = setInterval(() => {
			secondsLeft--;
			const days = Math.floor(secondsLeft / (3600 * 24));
			const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
			const minutes = Math.floor((secondsLeft % 3600) / 60);
			const seconds = secondsLeft % 60;

			countdownElement.innerText = `${days}D ${String(hours).padStart(2, "0")}H ${String(
				minutes,
			).padStart(2, "0")}M ${String(seconds).padStart(2, "0")}S`;
			if (secondsLeft <= 0) {
				clearInterval(interval);
				countdownElement.innerText = "ปิดประมูลแล้ว";
			}
		}, 1000);
	}
}

export function init() {
	console.log("Detail page initialized");
	loadAssetDetails();
}
