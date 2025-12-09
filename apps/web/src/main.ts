import { init as initChatAi } from "../pages/chat/ai/index";
import { init as initChat } from "../pages/chat/index";
import { init as initDetail } from "../pages/detail/index";
import { init as initIndex } from "../pages/index/index";
import { init as initSearch } from "../pages/search/index";
import { initAuthModal } from "./components/AuthModal";
import { initChatButton } from "./components/ChatButton";
import { initHeader } from "./components/Header";
import "./styles/index.css";

initAuthModal();
initHeader();
initChatButton();

// Route based on pathname first, then fall back to DOM element detection
const path = window.location.pathname;

if (path.includes("/chat/ai")) {
	if (document.getElementById("chat-messages")) {
		initChatAi();
	} else {
		console.warn("Chat AI page detected but chat-messages element not found");
	}
} else if (path === "/chat" || path.startsWith("/chat/")) {
	if (document.querySelector(".chat-options-container")) {
		initChat();
	} else {
		console.warn("Chat page detected but chat-options-container not found");
	}
} else if (path.startsWith("/detail")) {
	if (document.getElementById("asset-detail-content")) {
		initDetail();
	} else {
		console.warn("Detail page detected but asset-detail-content not found");
	}
} else if (path === "/search" || path.startsWith("/search")) {
	if (
		document.getElementById("inline-filters-container") ||
		document.getElementById("pagination-container")
	) {
		initSearch();
	} else {
		console.warn("Search page detected but search elements not found");
	}
} else if (path === "/" || path === "/index.html") {
	if (
		document.getElementById("asset-card-container") &&
		!document.getElementById("inline-filters-container")
	) {
		initIndex();
	} else {
		console.warn("Index page detected but asset-card-container not found");
	}
} else {
	// Fallback to DOM element detection for unknown paths
	if (document.getElementById("chat-messages")) {
		initChatAi();
	} else if (document.querySelector(".chat-options-container")) {
		initChat();
	} else if (document.getElementById("asset-detail-content")) {
		initDetail();
	} else if (
		document.getElementById("inline-filters-container") ||
		document.getElementById("pagination-container")
	) {
		initSearch();
	} else if (
		document.getElementById("asset-card-container") &&
		!document.getElementById("inline-filters-container")
	) {
		initIndex();
	} else {
		console.warn(`Unknown page structure, path: ${path}`);
	}
}
