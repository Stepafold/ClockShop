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
			this.container.innerHTML = `
                <div class="error">
                    <p>Для оформления доставки необходимо <a href="/auth" data-link>войти</a></p>
                </div>
            `;
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
            <div class="delivery-layout">
                <div class="delivery-form-wrapper">
                    <h2>Оформление доставки</h2>
                    <div id="form-container"></div>
                </div>
                <div class="orders-history-wrapper">
                    <h2>История заказов</h2>
                    <div id="orders-container" class="orders-list"></div>
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
			formContainer.innerHTML = '<p class="empty-message">Корзина пуста. Добавьте товары перед оформлением.</p>';
		} else {
			const form = document.createElement('form');
			form.id = 'deliveryForm';
			form.innerHTML = `
                <div class="form-group">
                    <label for="address">Адрес доставки</label>
                    <input type="text" id="address" required placeholder="Улица, дом, квартира">
                </div>
                <div class="form-group">
                    <label for="phone">Телефон</label>
                    <input type="tel" id="phone" required placeholder="+7 (xxx) xxx-xx-xx">
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required placeholder="example@mail.com">
                </div>
                <div class="form-group">
                    <label for="paymentMethod">Способ оплаты</label>
                    <select id="paymentMethod">
                        <option value="card">Банковская карта</option>
                        <option value="cash">Наличными при получении</option>
                    </select>
                </div>
                <button type="submit" id="submitOrder" class="btn-primary">Оформить заказ</button>
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
				container.innerHTML = '<p class="empty-message">У вас ещё нет заказов</p>';
				return;
			}

			let html = '';
			for (const order of orders) {
				html += `
                    <div class="order-card">
                        <div class="order-header">
                            <strong>№ ${order.id}</strong>
                            <span class="order-status">${this.getStatusText(order.status)}</span>
                        </div>
                        <div class="order-details">
                            <p>Сумма: ${order.total.toLocaleString()} ₽</p>
                            <p class="order-date">${new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                        </div>
                    </div>
                `;
			}
			container.innerHTML = html;
		} catch (error) {
			container.innerHTML = '<p class="error">Ошибка загрузки заказов</p>';
		}
	}

	private getStatusText(status: string): string {
		switch (status) {
			case 'pending': return 'В обработке';
			case 'completed': return 'Выполнен';
			case 'cancelled': return 'Отменён';
			default: return status;
		}
	}

	private attachFormHandler(form: HTMLFormElement, ordersContainer: HTMLElement): void {
		const messageDiv = form.querySelector('#message') as HTMLElement;
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const address = (form.querySelector('#address') as HTMLInputElement).value.trim();
			const phone = (form.querySelector('#phone') as HTMLInputElement).value.trim();
			const email = (form.querySelector('#email') as HTMLInputElement).value.trim();
			const paymentMethod = (form.querySelector('#paymentMethod') as HTMLSelectElement).value;

			if (!address || !phone || !email) {
				messageDiv.innerHTML = '<div class="error">Заполните все поля</div>';
				return;
			}

			try {
				await api.createOrder({ address, phone, email, paymentMethod });
				messageDiv.innerHTML = '<div class="success">Заказ успешно оформлен! Перенаправление...</div>';
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