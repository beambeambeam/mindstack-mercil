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
