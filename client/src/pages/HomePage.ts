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
		const { Header } = await import('../components/Header');
		const header = new Header(new Router(this.appContainer));
		this.appContainer.appendChild(header.getElement());
		this.appContainer.appendChild(this.container);

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
            <div class="filter-group">
                <input type="text" id="search" placeholder="Поиск по названию или описанию" value="${this.filters.search}">
            </div>
            <div class="filter-group">
                <select id="category">
                    <option value="">Все категории</option>
                    <option value="Люкс" ${this.filters.category === 'Люкс' ? 'selected' : ''}>Люкс</option>
                    <option value="Спорт" ${this.filters.category === 'Спорт' ? 'selected' : ''}>Спорт</option>
                    <option value="Классика" ${this.filters.category === 'Классика' ? 'selected' : ''}>Классика</option>
                </select>
            </div>
            <div class="filter-group checkbox">
                <label>
                    <input type="checkbox" id="inStock" ${this.filters.inStock ? 'checked' : ''}>
                    <span>Только в наличии</span>
                </label>
            </div>
            <div class="filter-group">
                <select id="sort">
                    <option value="">Без сортировки</option>
                    <option value="asc" ${this.filters.sort === 'asc' ? 'selected' : ''}>Цена ↑</option>
                    <option value="desc" ${this.filters.sort === 'desc' ? 'selected' : ''}>Цена ↓</option>
                </select>
            </div>
            <button id="applyFilters" class="apply-filters-btn">Применить</button>
        `;

		const searchInput = filterDiv.querySelector('#search') as HTMLInputElement;
		const categorySelect = filterDiv.querySelector('#category') as HTMLSelectElement;
		const inStockCheck = filterDiv.querySelector('#inStock') as HTMLInputElement;
		const sortSelect = filterDiv.querySelector('#sort') as HTMLSelectElement;
		const applyBtn = filterDiv.querySelector('#applyFilters') as HTMLButtonElement;

		const applyFilters = async () => {
			this.filters.search = searchInput.value;
			this.filters.category = categorySelect.value;
			this.filters.inStock = inStockCheck.checked;
			this.filters.sort = sortSelect.value as '' | 'asc' | 'desc';

			this.container.querySelector('.products-grid')?.remove();
			const loadingDiv = document.createElement('div');
			loadingDiv.className = 'loading-spinner';
			loadingDiv.textContent = 'Загрузка...';
			this.container.appendChild(loadingDiv);

			await this.loadProducts();
			loadingDiv.remove();
			this.renderProductList();
		};

		applyBtn.addEventListener('click', applyFilters);
		this.container.prepend(filterDiv);
	}

	private renderProductList(): void {
		const existingGrid = this.container.querySelector('.products-grid');
		if (existingGrid) existingGrid.remove();

		const productsGrid = document.createElement('div');
		productsGrid.className = 'products-grid';
		productsGrid.innerHTML = '';

		this.productCards = [];

		for (const product of this.filteredProducts) {
			const card = new ProductCard(product, () => {
				// обновление корзины
			});
			productsGrid.appendChild(card.getElement());
			this.productCards.push(card);
		}

		if (this.filteredProducts.length === 0) {
			const emptyMsg = document.createElement('div');
			emptyMsg.className = 'empty-message';
			emptyMsg.textContent = 'Товары не найдены';
			productsGrid.appendChild(emptyMsg);
		}

		this.container.appendChild(productsGrid);
	}
}