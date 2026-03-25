import type { CartItem as CartItemType } from '../../../shared/types';
import { api } from '../api';

export class CartItem {
	private element: HTMLElement;
	private item: CartItemType;
	private onUpdate: () => void;

	constructor(item: CartItemType, onUpdate: () => void) {
		this.item = item;
		this.onUpdate = onUpdate;
		this.element = document.createElement('div');
		this.element.className = 'cart-item';
		this.render();
	}

	async updateQuantity(newQuantity: number): Promise<void> {
		if (newQuantity < 1) {
			await this.remove();
			return;
		}
		try {
			await api.updateCartItem(this.item.productId, newQuantity);
			this.onUpdate();
			window.dispatchEvent(new Event('cart-updated'));
		} catch (error: any) {
			console.error('Update cart error:', error);
			alert('Ошибка обновления количества. Попробуйте позже.');
			this.onUpdate();
		}
	}

	async remove(): Promise<void> {
		try {
			await api.removeFromCart(this.item.productId);
			this.onUpdate();
			window.dispatchEvent(new Event('cart-updated'));
		} catch (error) {
			alert('Ошибка удаления товара');
		}
	}

	render(): void {
		const imageHtml = this.item.product.imageUrl
			? `<img src="${this.item.product.imageUrl}" alt="${this.item.product.name}" class="cart-item-image">`
			: '<div class="cart-item-image no-image"></div>';

		this.element.innerHTML = `
            <div class="cart-item-image-wrapper">
                ${imageHtml}
            </div>
            <div class="cart-item-info">
                <div class="cart-item-title">${this.item.product.name}</div>
                <div class="cart-item-price">${this.item.product.price.toLocaleString()} ₽</div>
            </div>
            <div class="cart-item-controls">
                <button class="decr" aria-label="Уменьшить количество">−</button>
                <span class="quantity">${this.item.quantity}</span>
                <button class="incr" aria-label="Увеличить количество">+</button>
                <button class="remove" aria-label="Удалить">✕</button>
            </div>
            <div class="cart-item-total">${(this.item.product.price * this.item.quantity).toLocaleString()} ₽</div>
        `;

		const decrBtn = this.element.querySelector('.decr') as HTMLButtonElement;
		const incrBtn = this.element.querySelector('.incr') as HTMLButtonElement;
		const removeBtn = this.element.querySelector('.remove') as HTMLButtonElement;
		const quantitySpan = this.element.querySelector('.quantity') as HTMLSpanElement;

		decrBtn.addEventListener('click', () => {
			const newQty = this.item.quantity - 1;
			if (newQty >= 1) {
				this.item.quantity = newQty;
				quantitySpan.textContent = String(newQty);
				this.updateQuantity(newQty);
			} else {
				this.remove();
			}
		});

		incrBtn.addEventListener('click', () => {
			const newQty = this.item.quantity + 1;
			this.item.quantity = newQty;
			quantitySpan.textContent = String(newQty);
			this.updateQuantity(newQty);
		});

		removeBtn.addEventListener('click', () => this.remove());
	}

	getElement(): HTMLElement {
		return this.element;
	}
}