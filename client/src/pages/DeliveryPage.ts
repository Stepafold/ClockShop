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

		const cart = await api.getCart();
		if (!cart.items.length) {
			this.container.innerHTML = '<div class="error">Корзина пуста. <a href="/" data-link>Вернуться на главную</a></div>';
			const link = this.container.querySelector('[data-link]');
			if (link) {
				link.addEventListener('click', (e) => {
					e.preventDefault();
					new Router(this.appContainer).navigate('/');
				});
			}
			return;
		}

		this.renderForm();
	}

	private renderForm(): void {
		this.container.innerHTML = `
            <h2>Оформление доставки</h2>
            <form id="deliveryForm" data-delivery>
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
            </form>
            <div id="message"></div>
        `;

		const form = this.container.querySelector('#deliveryForm') as HTMLFormElement;
		const messageDiv = this.container.querySelector('#message') as HTMLElement;

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const address = (document.getElementById('address') as HTMLInputElement).value;
			const phone = (document.getElementById('phone') as HTMLInputElement).value;
			const email = (document.getElementById('email') as HTMLInputElement).value;
			const paymentMethod = (document.getElementById('paymentMethod') as HTMLSelectElement).value;

			try {
				await api.createOrder({ address, phone, email, paymentMethod });
				messageDiv.innerHTML = '<div class="success">Заказ успешно оформлен! Мы свяжемся с вами.</div>';
				form.reset();
				setTimeout(() => {
					new Router(this.appContainer).navigate('/');
				}, 2000);
			} catch (error) {
				messageDiv.innerHTML = '<div class="error">Ошибка оформления заказа. Попробуйте позже.</div>';
			}
		});
	}
}