export function initChatButton(): void {
	const path = window.location.pathname;

	if (path.includes("/pages/chat/ai/") || path.includes("/chat/ai")) {
		return;
	}

	const existingButton = document.getElementById("floating-chat-button");
	if (existingButton) return;

	const button = document.createElement("a");
	button.id = "floating-chat-button";
	button.href = "/pages/chat/ai/";
	button.className = "floating-chat-button";
	button.innerHTML = "💬";
	button.setAttribute("aria-label", "ไปยังหน้าแชท");

	document.body.appendChild(button);
}
