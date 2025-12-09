const CLIENT_ID_KEY = "mercil_client_id";

function generateUUID(): string {
	return crypto.randomUUID();
}

export function getClientId(): string {
	if (typeof window === "undefined" || typeof localStorage === "undefined") {
		return generateUUID();
	}

	let clientId = localStorage.getItem(CLIENT_ID_KEY);

	if (!clientId) {
		clientId = generateUUID();
		localStorage.setItem(CLIENT_ID_KEY, clientId);
	}

	return clientId;
}
