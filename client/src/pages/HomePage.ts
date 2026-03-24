import type { Product } from '../../../shared/types';
import { api } from '../api';
import { ProductCard } from '../components/ProductCard';
import { Router } from '../router';

export class HomePage {
	private container: HTMLElement;
	private products: Product[];
	private filteredProducts: Product[];
	private productCards: ProductCard[];
	private filters: {
		search: string;
		category: string;
		inStock: boolean;
		sort: '' | 'asc' | 'desc';
	};
	private appContainer: HTMLElement;

	constructor(appContainer: HTMLElement) {
		this.appContainer = appContainer;
		this.container = document.createElement('div');
		this.container.className = 'page home-page';
		this.products = [];
		this.filteredProducts = [];
		this.productCards = [];
		this.filters = {
			search: '',
			category: '',
			inStock: false,
			sort: ''
		};
	}

	async render(): Promise<void> {
		this.appContainer.innerHTML = '';
		// Header уже добавлен извне? В нашем роутере он не добавляется. Нужно добавить Header здесь.
		// Лучше сделать так: Header рендерится в index.ts один раз и обновляется через события.
		// Для простоты оставим как в оригинале – пусть каждая страница сама рендерит Header.
		// Но чтобы не дублировать код, вынесем создание Header в index.ts и будем обновлять через события.
		// Однако для сохранения совместимости с вашим кодом я добавлю Header здесь (временно).
		// В финальной версии лучше вынести Header в корневой компонент.
		const { Header } = await import('../components/Header');
		const header = new Header(new Router(this.appContainer));
		this.appContainer.appendChild(header.getElement());
		this.appContainer.appendChild(this.container);
		this.container.innerHTML = '<div class="loading">Загрузка...</div>';

		try {
			await this.loadProducts();
			this.renderFilters();
			this.renderProductList();
		} catch (error) {
			this.container.innerHTML = '<div class="error">Ошибка загрузки товаров</div>';
		}
	}

	private async loadProducts(): Promise<void> {
		this.products = await api.getProducts({
			search: this.filters.search || undefined,
			category: this.filters.category || undefined,
			inStock: this.filters.inStock || undefined,
			sort: this.filters.sort || undefined
		});
		this.filteredProducts = [...this.products];
	}

	private renderFilters(): void {
		const filterDiv = document.createElement('div');
		filterDiv.className = 'filters';
		filterDiv.innerHTML = `
            <input type="text" id="search" placeholder="Поиск по названию или описанию" value="${this.filters.search}">
            <select id="category">
                <option value="">Все категории</option>
                <option value="Люкс" ${this.filters.category === 'Люкс' ? 'selected' : ''}>Люкс</option>
                <option value="Спорт" ${this.filters.category === 'Спорт' ? 'selected' : ''}>Спорт</option>
                <option value="Классика" ${this.filters.category === 'Классика' ? 'selected' : ''}>Классика</option>
            </select>
            <label>
                <input type="checkbox" id="inStock" ${this.filters.inStock ? 'checked' : ''}> Только в наличии
            </label>
            <select id="sort">
                <option value="">Без сортировки</option>
                <option value="asc" ${this.filters.sort === 'asc' ? 'selected' : ''}>Цена ↑</option>
                <option value="desc" ${this.filters.sort === 'desc' ? 'selected' : ''}>Цена ↓</option>
            </select>
            <button id="applyFilters">Применить</button>
        `;

		const searchInput = filterDiv.querySelector('#search') as HTMLInputElement;
		const categorySelect = filterDiv.querySelector('#category') as HTMLSelectElement;
		const inStockCheck = filterDiv.querySelector('#inStock') as HTMLInputElement;
		const sortSelect = filterDiv.querySelector('#sort') as HTMLSelectElement;
		const applyBtn = filterDiv.querySelector('#applyFilters') as HTMLButtonElement;

		applyBtn.addEventListener('click', async () => {
			this.filters.search = searchInput.value;
			this.filters.category = categorySelect.value;
			this.filters.inStock = inStockCheck.checked;
			this.filters.sort = sortSelect.value as '' | 'asc' | 'desc';
			await this.loadProducts();
			this.renderProductList();
		});

		this.container.prepend(filterDiv);
	}

	private renderProductList(): void {
		const productsGrid = document.createElement('div');
		productsGrid.className = 'products-grid';
		productsGrid.innerHTML = '';

		this.productCards = [];

		for (const product of this.filteredProducts) {
			const card = new ProductCard(product, () => {
				// обновление корзины не требуется на главной
			});
			productsGrid.appendChild(card.getElement());
			this.productCards.push(card);
		}

		const existingGrid = this.container.querySelector('.products-grid');
		if (existingGrid) existingGrid.remove();
		this.container.appendChild(productsGrid);
	}
}