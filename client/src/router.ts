import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { AuthPage } from './pages/AuthPage';

type PageConstructor = new (container: HTMLElement) => { render: () => Promise<void> };

export class Router {
	private routes: Record<string, PageConstructor>;
	private container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
		this.routes = {
			'/': HomePage,
			'/cart': CartPage,
			'/delivery': DeliveryPage,
			'/auth': AuthPage
		};
		window.addEventListener('popstate', () => this.handleRoute());
	}

	async handleRoute(): Promise<void> {
		const path = window.location.pathname;
		const PageClass = this.routes[path] || HomePage;
		const page = new PageClass(this.container);
		await page.render();
	}

	navigate(path: string): void {
		window.history.pushState({}, '', path);
		this.handleRoute();
	}
}