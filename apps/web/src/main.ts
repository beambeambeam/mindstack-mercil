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
	console.warn(`Unknown page structure, path: ${window.location.pathname}`);
}
