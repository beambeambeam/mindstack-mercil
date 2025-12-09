import { init as initChat } from "../pages/chat/index";
import { init as initDetail } from "../pages/detail/index";
import { init as initIndex } from "../pages/index/index";
import { init as initSearch } from "../pages/search/index";
import { initAuthModal } from "./components/AuthModal";
import { initHeader } from "./components/Header";
import "./styles/index.css";

initAuthModal();
initHeader();

const path = window.location.pathname;

if (path.includes("/pages/search/") || path.includes("/search")) {
	initSearch();
} else if (path.includes("/pages/chat/") || path.includes("/chat")) {
	initChat();
} else if (path.includes("/pages/detail/") || path.includes("/detail")) {
	initDetail();
} else {
	initIndex();
}
