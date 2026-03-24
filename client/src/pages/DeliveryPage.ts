import { api } from '../api';
import { Router } from '../router';

export class DeliveryPage {
	private container: HTMLElement;
	private appContainer: HTMLElement;

	constructor(appContainer: HTMLElement) {
		this.appContainer = appContainer;
		this.container = document.createElement('div');
		this.container.className = 'page delivery-page';
	}

	async render(): Promise<void> {
		this.appContainer.innerHTML = '';
		const { Header } = await import('../components/Header');
		const header = new Header(new Router(this.appContainer));
		this.appContainer.appendChild(header.getElement());
		this.appContainer.appendChild(this.container);

		const user = await api.getCurrentUser();
		if (!user) {
			this.container.innerHTML = '<div class="error">Для оформления доставки необходимо <a href="/auth" data-link>войти</a></div>';
			const link = this.container.querySelector('[data-link]');
			if (link) {
				link.addEventListener('click', (e) => {
					e.preventDefault();
					new Router(this.appContainer).navigate('/auth');
				});
			}
			return;
		}

		this.container.innerHTML = `
			<div style="display: flex; gap: 2rem; margin-top: 2rem;">
				<div style="flex: 1;">
					<h2>Оформление доставки</h2>
					<div id="form-container"></div>
				</div>
				<div style="flex: 1;">
					<h2>История заказов</h2>
					<div id="orders-container" style="min-height: 200px;"></div>
				</div>
			</div>
		`;

		const formContainer = this.container.querySelector('#form-container') as HTMLElement;
		const ordersContainer = this.container.querySelector('#orders-container') as HTMLElement;

		let cart;
		try {
			cart = await api.getCart();
		} catch (error: any) {
			formContainer.innerHTML = '<p style="color: red;">Ошибка загрузки корзины. Попробуйте перезагрузить страницу.</p>';
			await this.renderOrders(ordersContainer);
			return;
		}

		if (!cart.items.length) {
			formContainer.innerHTML = '<p style="color: #999;">Корзина пуста. Добавьте товары перед оформлением.</p>';
		} else {
			const form = document.createElement('form');
			form.id = 'deliveryForm';
			form.innerHTML = `
				<div class="form-group">
					<label for="address">Адрес доставки</label>
					<input type="text" id="address" required>
				</div>
				<div class="form-group">
					<label for="phone">Телефон</label>
					<input type="tel" id="phone" required>
				</div>
				<div class="form-group">
					<label for="email">Email</label>
					<input type="email" id="email" required>
				</div>
				<div class="form-group">
					<label>Способ оплаты</label>
					<select id="paymentMethod">
						<option value="card">Банковская карта</option>
						<option value="cash">Наличными при получении</option>
					</select>
				</div>
				<button type="submit" id="submitOrder">Оформить заказ</button>
				<div id="message" style="margin-top: 1rem;"></div>
			`;
			formContainer.appendChild(form);
			this.attachFormHandler(form, ordersContainer);
		}

		await this.renderOrders(ordersContainer);
	}

	private async renderOrders(container: HTMLElement): Promise<void> {
		try {
			const orders = await api.getUserOrders();
			if (orders.length === 0) {
				container.innerHTML = '<p style="color: #999;">У вас ещё нет заказов</p>';
				return;
			}

			let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
			for (const order of orders) {
				html += `
					<div style="border: 1px solid #ddd; padding: 1rem; border-radius: 4px;">
						<p><strong>№ ${order.id}</strong> - ${order.status}</p>
						<p>Сумма: ${order.total} ₽</p>
						<p style="font-size: 0.9em; color: #666;">${new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
					</div>
				`;
			}
			html += '</div>';
			container.innerHTML = html;
		} catch (error: any) {
			const errorMsg = error?.message || 'Ошибка загрузки заказов';
			container.innerHTML = `<p style="color: red;">${errorMsg}</p>`;
		}
	}

	private attachFormHandler(form: HTMLFormElement, ordersContainer: HTMLElement): void {
		const messageDiv = form.querySelector('#message') as HTMLElement;
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const address = (form.querySelector('#address') as HTMLInputElement).value;
			const phone = (form.querySelector('#phone') as HTMLInputElement).value;
			const email = (form.querySelector('#email') as HTMLInputElement).value;
			const paymentMethod = (form.querySelector('#paymentMethod') as HTMLSelectElement).value;

			try {
				await api.createOrder({ address, phone, email, paymentMethod });
				messageDiv.innerHTML = '<div class="success">Заказ успешно оформлен!</div>';
				form.reset();
				await this.renderOrders(ordersContainer);
				setTimeout(() => {
					window.location.href = '/';
				}, 2000);
			} catch (error: any) {
				const errorMessage = error.message || 'Неизвестная ошибка';
				messageDiv.innerHTML = `<div class="error">Ошибка оформления заказа: ${errorMessage}</div>`;
				console.error('Order error:', error);
			}
		});
	}
}