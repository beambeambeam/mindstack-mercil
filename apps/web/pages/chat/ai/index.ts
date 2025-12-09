import { chatWithAI } from "../../../src/services/api";

interface ChatMessage {
	role: "user" | "ai";
	content: string;
	timestamp: Date;
}

const messages: ChatMessage[] = [];
let sessionId: string | null = null;

function getSessionId(): string {
	if (!sessionId) {
		sessionId = sessionStorage.getItem("ai_chat_session_id");
		if (!sessionId) {
			sessionId = crypto.randomUUID();
			sessionStorage.setItem("ai_chat_session_id", sessionId);
		}
	}
	return sessionId;
}

function formatTime(date: Date): string {
	return date.toLocaleTimeString("th-TH", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function renderMessage(message: ChatMessage): void {
	const messagesContainer = document.getElementById("chat-messages");
	if (!messagesContainer) return;

	const messageDiv = document.createElement("div");
	messageDiv.className = `message ${message.role}-message`;

	const contentDiv = document.createElement("div");
	contentDiv.className = "message-content";

	const textP = document.createElement("p");
	textP.textContent = message.content;
	contentDiv.appendChild(textP);

	const timeDiv = document.createElement("div");
	timeDiv.className = "message-time";
	timeDiv.textContent = formatTime(message.timestamp);

	messageDiv.appendChild(contentDiv);
	messageDiv.appendChild(timeDiv);

	messagesContainer.appendChild(messageDiv);
	scrollToBottom();
}

function scrollToBottom(): void {
	const messagesContainer = document.getElementById("chat-messages");
	if (messagesContainer) {
		messagesContainer.scrollTop = messagesContainer.scrollHeight;
	}
}

function showLoading(): void {
	const loadingIndicator = document.getElementById("loading-indicator");
	if (loadingIndicator) {
		loadingIndicator.style.display = "block";
		scrollToBottom();
	}
}

function hideLoading(): void {
	const loadingIndicator = document.getElementById("loading-indicator");
	if (loadingIndicator) {
		loadingIndicator.style.display = "none";
	}
}

async function sendMessage(messageText: string): Promise<void> {
	if (!messageText.trim()) return;

	const userMessage: ChatMessage = {
		role: "user",
		content: messageText.trim(),
		timestamp: new Date(),
	};

	messages.push(userMessage);
	renderMessage(userMessage);

	const input = document.getElementById("chat-input") as HTMLInputElement;
	const sendButton = document.getElementById(
		"send-button",
	) as HTMLButtonElement;

	if (input) input.value = "";
	if (sendButton) sendButton.disabled = true;

	showLoading();

	try {
		const sessionId = getSessionId();
		const response = await chatWithAI(messageText.trim(), sessionId);

		const aiMessage: ChatMessage = {
			role: "ai",
			content: response.response_text,
			timestamp: new Date(),
		};

		messages.push(aiMessage);
		hideLoading();
		renderMessage(aiMessage);
	} catch (error) {
		hideLoading();
		const errorMessage: ChatMessage = {
			role: "ai",
			content:
				error instanceof Error
					? `ขออภัย เกิดข้อผิดพลาด: ${error.message}`
					: "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI Bot กรุณาลองใหม่อีกครั้ง",
			timestamp: new Date(),
		};
		messages.push(errorMessage);
		renderMessage(errorMessage);
	} finally {
		if (sendButton) sendButton.disabled = false;
		if (input) input.focus();
	}
}

export function init(): void {
	const input = document.getElementById("chat-input") as HTMLInputElement;
	const sendButton = document.getElementById(
		"send-button",
	) as HTMLButtonElement;

	if (!input || !sendButton) return;

	const handleSend = () => {
		const messageText = input.value;
		if (messageText.trim()) {
			sendMessage(messageText);
		}
	};

	sendButton.addEventListener("click", handleSend);

	input.addEventListener("keypress", (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	});

	input.focus();
}
