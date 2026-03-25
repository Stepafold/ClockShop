import type { Product } from '../../../shared/types';
import { api } from '../api';

export class ProductCard {
	private element: HTMLElement;
	private product: Product;
	private onCartUpdate?: () => void;

	constructor(product: Product, onCartUpdate?: () => void) {
		this.product = product;
		this.onCartUpdate = onCartUpdate;
		this.element = document.createElement('div');
		this.element.className = 'product-card';
		this.render();
	}

	private async addToCart(quantity: number): Promise<void> {
		const btn = this.element.querySelector('.add-to-cart-btn') as HTMLButtonElement;
		const originalText = btn.textContent;
		try {
			await api.addToCart(this.product.id, quantity);
			btn.textContent = '✓ Добавлено';
			btn.classList.add('added');
			setTimeout(() => {
				btn.textContent = originalText;
				btn.classList.remove('added');
			}, 2000);
			if (this.onCartUpdate) this.onCartUpdate();
			window.dispatchEvent(new Event('cart-updated'));
		} catch (error) {
			alert('Ошибка добавления в корзину. Возможно, вы не авторизованы.');
		}
	}

	render(): void {
		const imageHtml = this.product.imageUrl
			? `<div class="product-image"><img src="${this.product.imageUrl}" alt="${this.product.name}"></div>`
			: '<div class="product-image no-image"></div>';

		this.element.innerHTML = `
            ${imageHtml}
            <div class="product-info">
                <h3>${this.product.name}</h3>
                <p class="price">${this.product.price.toLocaleString()} ₽</p>
                <p class="description">${this.product.description}</p>
                <div class="product-meta">
                    <span class="category">${this.product.category}</span>
                    <span class="stock ${this.product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${this.product.stock > 0 ? 'В наличии' : 'Нет в наличии'}
                    </span>
                </div>
                <div class="add-to-cart-control">
                    <input type="number" class="qty" value="1" min="1" max="${this.product.stock}">
                    <button class="add-to-cart-btn">В корзину</button>
                </div>
            </div>
        `;

		const btn = this.element.querySelector('.add-to-cart-btn') as HTMLButtonElement;
		const qtyInput = this.element.querySelector('.qty') as HTMLInputElement;

		btn.addEventListener('click', () => {
			const quantity = parseInt(qtyInput.value, 10);
			if (quantity > 0 && quantity <= this.product.stock) {
				this.addToCart(quantity);
			} else {
				alert('Некорректное количество');
			}
		});
	}

	getElement(): HTMLElement {
		return this.element;
	}
}