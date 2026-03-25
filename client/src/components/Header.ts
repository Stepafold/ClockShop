import { Router } from '../router';
import { api } from '../api';

export class Header {
	private element: HTMLElement;
	private router: Router;
	private isLoggedIn: boolean;
	private cartItemCount: number;

	constructor(router: Router) {
		this.router = router;
		this.element = document.createElement('header');
		this.element.className = 'header';
		this.isLoggedIn = false;
		this.cartItemCount = 0;
		this.checkAuth();
		this.updateCartCount();
		window.addEventListener('cart-updated', () => this.updateCartCount());
	}

	async checkAuth(): Promise<void> {
		const user = await api.getCurrentUser();
		this.isLoggedIn = !!user;
		this.render();
	}

	async updateCartCount(): Promise<void> {
		if (!this.isLoggedIn) {
			this.cartItemCount = 0;
			this.render();
			return;
		}
		try {
			const cart = await api.getCart();
			this.cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
			this.render();
		} catch {
			this.cartItemCount = 0;
			this.render();
		}
	}

	render(): void {
		this.element.innerHTML = `
            <div class="logo">⌚ ClockShop</div>
            <nav>
                <a href="/" data-link>Главная</a>
                ${this.isLoggedIn ? `<a href="/cart" data-link>Корзина ${this.cartItemCount > 0 ? `<span class="cart-badge">${this.cartItemCount}</span>` : ''}</a>` : ''}
                ${this.isLoggedIn ? '<a href="/delivery" data-link>Доставка</a>' : ''}
                ${!this.isLoggedIn ? '<a href="/auth" data-link>Войти</a>' : ''}
                ${this.isLoggedIn ? '<button id="logoutBtn" class="logout-btn">Выйти</button>' : ''}
            </nav>
        `;

		this.element.querySelectorAll('[data-link]').forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const href = link.getAttribute('href');
				if (href) this.router.navigate(href);
			});
		});

		const logoutBtn = this.element.querySelector('#logoutBtn');
		if (logoutBtn) {
			logoutBtn.addEventListener('click', async () => {
				await api.logout();
				this.isLoggedIn = false;
				this.cartItemCount = 0;
				this.render();
				this.router.navigate('/');
				window.dispatchEvent(new Event('cart-updated'));
			});
		}
	}

	getElement(): HTMLElement {
		return this.element;
	}
}