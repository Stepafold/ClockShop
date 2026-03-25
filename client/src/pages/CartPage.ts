import type { Cart } from '../../../shared/types';
import { api } from '../api';
import { CartItem } from '../components/CartItem';
import { Router } from '../router';

export class CartPage {
	private container: HTMLElement;
	private appContainer: HTMLElement;
	private cart: Cart | null;
	private cartItemsComponents: CartItem[];

	constructor(appContainer: HTMLElement) {
		this.appContainer = appContainer;
		this.container = document.createElement('div');
		this.container.className = 'page cart-page';
		this.cart = null;
		this.cartItemsComponents = [];
	}

	async render(): Promise<void> {
		this.appContainer.innerHTML = '';
		const { Header } = await import('../components/Header');
		const header = new Header(new Router(this.appContainer));
		this.appContainer.appendChild(header.getElement());
		this.appContainer.appendChild(this.container);
		this.container.innerHTML = '<div class="loading-spinner">Загрузка корзины...</div>';

		try {
			await this.loadCart();
			if (!this.cart || this.cart.items.length === 0) {
				this.container.innerHTML = `
                    <div class="empty-cart">
                        <p>Ваша корзина пуста</p>
                        <a href="/" data-link class="btn-primary">Вернуться на главную</a>
                    </div>
                `;
				const link = this.container.querySelector('[data-link]');
				if (link) {
					link.addEventListener('click', (e) => {
						e.preventDefault();
						new Router(this.appContainer).navigate('/');
					});
				}
				return;
			}
			this.renderCart();
		} catch (error) {
			this.container.innerHTML = '<div class="error">Ошибка загрузки корзины</div>';
		}
	}

	private async loadCart(): Promise<void> {
		this.cart = await api.getCart();
	}

	private renderCart(): void {
		this.container.innerHTML = `
            <h2>Корзина</h2>
            <div class="cart-items-list"></div>
            <div class="cart-summary">
                <div class="total-price">Итого: <span id="total">0</span> ₽</div>
                <button id="checkoutBtn" class="btn-primary checkout-btn">Перейти к оформлению</button>
            </div>
        `;

		const listContainer = this.container.querySelector('.cart-items-list') as HTMLElement;
		this.cartItemsComponents = [];

		for (const item of this.cart!.items) {
			const cartItem = new CartItem(item, () => this.refresh());
			listContainer.appendChild(cartItem.getElement());
			this.cartItemsComponents.push(cartItem);
		}

		this.updateTotal();

		const checkoutBtn = this.container.querySelector('#checkoutBtn') as HTMLButtonElement;
		checkoutBtn.addEventListener('click', () => {
			new Router(this.appContainer).navigate('/delivery');
		});
	}

	private updateTotal(): void {
		if (!this.cart) return;
		const total = this.cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
		const totalSpan = this.container.querySelector('#total');
		if (totalSpan) totalSpan.textContent = total.toLocaleString();
	}

	private async refresh(): Promise<void> {
		try {
			await this.loadCart();
			this.renderCart();
		} catch (error: any) {
			if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
				new Router(this.appContainer).navigate('/auth');
			}
		}
	}
}