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
		try {
			await api.addToCart(this.product.id, quantity);
			if (this.onCartUpdate) this.onCartUpdate();
		} catch (error) {
			alert('Ошибка добавления в корзину. Возможно, вы не авторизованы.');
		}
	}

	render(): void {
		// data-атрибуты для главной страницы
		this.element.setAttribute('data-title', this.product.name);
		this.element.setAttribute('data-price', String(this.product.price));

		this.element.innerHTML = `
            <h3>${this.product.name}</h3>
            <p class="price">${this.product.price} ₽</p>
            <p class="description">${this.product.description}</p>
            <p class="category">Категория: ${this.product.category}</p>
            <p class="stock">${this.product.stock > 0 ? 'В наличии' : 'Нет в наличии'}</p>
            <div class="add-to-cart-control">
                <input type="number" class="qty" value="1" min="1" max="${this.product.stock}">
                <button class="add-to-cart-btn">В корзину</button>
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