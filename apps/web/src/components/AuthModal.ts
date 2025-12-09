export function initAuthModal(): void {
	const modal = document.getElementById("auth-modal");
	const loginBtn = document.querySelector<HTMLElement>(".login-btn");
	const closeBtn = document.querySelector<HTMLElement>(".close-btn");
	const tabLogin = document.getElementById("tab-login");
	const tabRegister = document.getElementById("tab-register");
	const formLogin = document.getElementById("login-form");
	const formRegister = document.getElementById("register-form");

	if (!modal) return;

	function showForm(type: "login" | "register"): void {
		if (type === "login") {
			tabLogin?.classList.add("active");
			tabRegister?.classList.remove("active");
			formLogin?.classList.add("active");
			formRegister?.classList.remove("active");
		} else if (type === "register") {
			tabRegister?.classList.add("active");
			tabLogin?.classList.remove("active");
			formRegister?.classList.add("active");
			formLogin?.classList.remove("active");
		}
	}

	if (loginBtn) {
		loginBtn.onclick = () => {
			modal.style.display = "block";
			showForm("login");
		};
	}

	if (closeBtn) {
		closeBtn.onclick = () => {
			modal.style.display = "none";
		};
	}

	window.onclick = (event: MouseEvent) => {
		if (event.target === modal) {
			modal.style.display = "none";
		}
	};

	if (tabLogin) {
		tabLogin.onclick = () => showForm("login");
	}

	if (tabRegister) {
		tabRegister.onclick = () => showForm("register");
	}
}
