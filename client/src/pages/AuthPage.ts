import { api } from '../api';
import { Router } from '../router';

export class AuthPage {
	private container: HTMLElement;
	private appContainer: HTMLElement;

	constructor(appContainer: HTMLElement) {
		this.appContainer = appContainer;
		this.container = document.createElement('div');
		this.container.className = 'page auth-page';
	}

	async render(): Promise<void> {
		this.appContainer.innerHTML = '';
		const { Header } = await import('../components/Header');
		const header = new Header(new Router(this.appContainer));
		this.appContainer.appendChild(header.getElement());
		this.appContainer.appendChild(this.container);
		this.renderAuthForm();
	}

	private renderAuthForm(): void {
		this.container.innerHTML = `
            <div class="auth-tabs">
                <button id="loginTab" class="active">Вход</button>
                <button id="registerTab">Регистрация</button>
            </div>
            <div id="authFormContainer" data-registration></div>
        `;

		const loginTab = this.container.querySelector('#loginTab') as HTMLButtonElement;
		const registerTab = this.container.querySelector('#registerTab') as HTMLButtonElement;
		const formContainer = this.container.querySelector('#authFormContainer') as HTMLElement;

		const showLogin = () => {
			loginTab.classList.add('active');
			registerTab.classList.remove('active');
			formContainer.innerHTML = this.getLoginFormHtml();
			this.attachLoginHandler();
		};

		const showRegister = () => {
			registerTab.classList.add('active');
			loginTab.classList.remove('active');
			formContainer.innerHTML = this.getRegisterFormHtml();
			this.attachRegisterHandler();
		};

		loginTab.addEventListener('click', showLogin);
		registerTab.addEventListener('click', showRegister);

		showLogin();
	}

	private getLoginFormHtml(): string {
		return `
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Пароль</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit">Войти</button>
            </form>
            <div id="authMessage"></div>
        `;
	}

	private getRegisterFormHtml(): string {
		return `
            <form id="registerForm">
                <div class="form-group">
                    <label for="regName">Имя</label>
                    <input type="text" id="regName" required>
                </div>
                <div class="form-group">
                    <label for="regEmail">Email</label>
                    <input type="email" id="regEmail" required>
                </div>
                <div class="form-group">
                    <label for="regPhone">Телефон (необязательно)</label>
                    <input type="tel" id="regPhone">
                </div>
                <div class="form-group">
                    <label for="regPassword">Пароль</label>
                    <input type="password" id="regPassword" required>
                </div>
                <button type="submit">Зарегистрироваться</button>
            </form>
            <div id="authMessage"></div>
        `;
	}

	private attachLoginHandler(): void {
		const form = this.container.querySelector('#loginForm') as HTMLFormElement;
		const messageDiv = this.container.querySelector('#authMessage') as HTMLElement;
		if (!form) return;

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
			const password = (document.getElementById('loginPassword') as HTMLInputElement).value;

			try {
				await api.login({ email, password });
				messageDiv.innerHTML = '<div class="success">Вход выполнен. Перенаправление...</div>';
				setTimeout(() => {
					new Router(this.appContainer).navigate('/');
				}, 1000);
			} catch (error) {
				messageDiv.innerHTML = '<div class="error">Ошибка входа. Проверьте данные.</div>';
			}
		});
	}

	private attachRegisterHandler(): void {
		const form = this.container.querySelector('#registerForm') as HTMLFormElement;
		const messageDiv = this.container.querySelector('#authMessage') as HTMLElement;
		if (!form) return;

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const name = (document.getElementById('regName') as HTMLInputElement).value;
			const email = (document.getElementById('regEmail') as HTMLInputElement).value;
			const phone = (document.getElementById('regPhone') as HTMLInputElement).value;
			const password = (document.getElementById('regPassword') as HTMLInputElement).value;

			try {
				await api.register({ email, password, name, phone });
				messageDiv.innerHTML = '<div class="success">Регистрация успешна. Выполняется вход...</div>';
				setTimeout(() => {
					new Router(this.appContainer).navigate('/');
				}, 1000);
			} catch (error) {
				messageDiv.innerHTML = '<div class="error">Ошибка регистрации. Возможно, email уже используется.</div>';
			}
		});
	}
}