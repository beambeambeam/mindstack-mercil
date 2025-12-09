import { initMap } from "../components/Map";
import { getAssetByCode } from "../services/api";
import { formatPrice } from "../utils/format";

function getUrlParameter(name: string): string {
	name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
	const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
	const results = regex.exec(location.search);
	return results === null
		? ""
		: decodeURIComponent(results[1].replace(/\+/g, " "));
}

function updateCountdown(): void {
	const countdownElement = document.getElementById("live-timer");
	if (!countdownElement) return;

	let secondsLeft = 1 * 24 * 60 * 60 + 5 * 3600 + 30 * 60;

	const interval = setInterval(() => {
		secondsLeft--;
		const days = Math.floor(secondsLeft / (3600 * 24));
		const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
		const minutes = Math.floor((secondsLeft % 3600) / 60);
		const seconds = secondsLeft % 60;

		countdownElement.innerText = `${days}D ${String(hours).padStart(2, "0")}H ${String(minutes).padStart(2, "0")}M ${String(seconds).padStart(2, "0")}S`;
		if (secondsLeft <= 0) {
			clearInterval(interval);
			countdownElement.innerText = "ปิดประมูลแล้ว";
		}
	}, 1000);
}

export async function init(): Promise<void> {
	const assetCode = getUrlParameter("asset_code");

	if (!assetCode) {
		const detailName = document.getElementById("asset-detail-name");
		if (detailName) {
			detailName.innerText = "ไม่พบรหัสทรัพย์สิน";
		}
		return;
	}

	try {
		const asset = await getAssetByCode(assetCode);

		const titleElement = document.getElementById("asset-title");
		const detailNameElement = document.getElementById("asset-detail-name");
		const detailCodeElement = document.getElementById("asset-detail-code");
		const startingPriceElement = document.getElementById("starting-price");
		const currentPriceElement = document.getElementById("current-price");
		const closingTimeElement = document.getElementById("closing-time");
		const descriptionElement = document.getElementById("asset-description");
		const areaSizeElement = document.getElementById("area-size");
		const numBedElement = document.getElementById("num-bed");
		const numBathElement = document.getElementById("num-bath");

		const name = asset.name_th || "ไม่ระบุชื่อ";
		const priceFormatted = formatPrice(asset.price);

		if (titleElement) titleElement.innerText = name;
		if (detailNameElement) detailNameElement.innerText = name;
		if (detailCodeElement) {
			detailCodeElement.innerText = `รหัสทรัพย์: ${asset.asset_code}`;
		}
		if (startingPriceElement) {
			startingPriceElement.innerText = `${priceFormatted} บาท`;
		}
		if (currentPriceElement) {
			currentPriceElement.innerText = `${priceFormatted} บาท (ราคาเริ่มต้น)`;
		}
		if (closingTimeElement) {
			closingTimeElement.innerText = "25 พ.ย. 2568 เวลา 14:00 น.";
		}
		if (descriptionElement) {
			const description = asset.description_th || "ไม่มีรายละเอียด";
			descriptionElement.innerText = description.replace(/\r\n/g, "\n");
		}
		if (areaSizeElement) {
			areaSizeElement.innerText = asset.bedrooms?.toString() || "N/A";
		}
		if (numBedElement) {
			numBedElement.innerText = asset.bedrooms?.toString() || "N/A";
		}
		if (numBathElement) {
			numBathElement.innerText = asset.bathrooms?.toString() || "N/A";
		}

		if (
			asset.location_latitude !== null &&
			asset.location_longitude !== null &&
			!Number.isNaN(asset.location_latitude) &&
			!Number.isNaN(asset.location_longitude)
		) {
			const miniMap = initMap(
				"mini-map",
				asset.location_latitude,
				asset.location_longitude,
				15,
				name,
			);
			if (miniMap) {
				setTimeout(() => miniMap.invalidateSize(), 100);
			}
		} else {
			const miniMapElement = document.getElementById("mini-map");
			if (miniMapElement) {
				miniMapElement.innerHTML =
					'<p style="padding: 20px;">ไม่พบพิกัดทรัพย์สินนี้</p>';
			}
		}

		updateCountdown();
	} catch (error) {
		console.error("Error loading asset details:", error);
		const detailName = document.getElementById("asset-detail-name");
		if (detailName) {
			detailName.innerText = "ไม่พบทรัพย์สินนี้";
		}
	}
}
