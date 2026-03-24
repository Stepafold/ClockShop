import type { Product, Cart, Order } from '../../shared/types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Unknown error' }));
		throw new Error(error.message || 'Request failed');
	}
	return response.json();
}

export const api = {
	async getProducts(params?: {
		search?: string;
		category?: string;
		inStock?: boolean;
		sort?: 'asc' | 'desc';
	}): Promise<Product[]> {
		const url = new URL(`${API_BASE}/products`, window.location.origin);
		if (params) {
			if (params.search) url.searchParams.set('search', params.search);
			if (params.category) url.searchParams.set('category', params.category);
			if (params.inStock !== undefined) url.searchParams.set('inStock', String(params.inStock));
			if (params.sort) url.searchParams.set('sort', params.sort);
		}
		const response = await fetch(url);
		return handleResponse<Product[]>(response);
	},

	async getCart(): Promise<Cart> {
		const response = await fetch(`${API_BASE}/cart`, {
			credentials: 'include'
		});
		return handleResponse<Cart>(response);
	},

	async addToCart(productId: string, quantity: number): Promise<void> {
		const response = await fetch(`${API_BASE}/cart`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ productId, quantity }),
			credentials: 'include'
		});
		await handleResponse(response);
	},

	async updateCartItem(productId: string, quantity: number): Promise<void> {
		const response = await fetch(`${API_BASE}/cart/${productId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ quantity }),
			credentials: 'include'
		});
		await handleResponse(response);
	},

	async removeFromCart(productId: string): Promise<void> {
		const response = await fetch(`${API_BASE}/cart/${productId}`, {
			method: 'DELETE',
			credentials: 'include'
		});
		await handleResponse(response);
	},

	async createOrder(orderData: {
		address: string;
		phone: string;
		email: string;
		paymentMethod: string;
	}): Promise<Order> {
		const response = await fetch(`${API_BASE}/orders`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(orderData),
			credentials: 'include'
		});
		return handleResponse<Order>(response);
	},

	async register(userData: {
		email: string;
		password: string;
		name: string;
		phone?: string;
	}): Promise<{ user: { id: string; email: string; name: string } }> {
		const response = await fetch(`${API_BASE}/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(userData),
			credentials: 'include'
		});
		return handleResponse(response);
	},

	async login(credentials: { email: string; password: string }): Promise<{ user: { id: string; email: string; name: string } }> {
		const response = await fetch(`${API_BASE}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(credentials),
			credentials: 'include'
		});
		return handleResponse(response);
	},

	async logout(): Promise<void> {
		const response = await fetch(`${API_BASE}/auth/logout`, {
			method: 'POST',
			credentials: 'include'
		});
		await handleResponse(response);
	},

	async getCurrentUser(): Promise<{ user: { id: string; email: string; name: string } } | null> {
		try {
			const response = await fetch(`${API_BASE}/auth/me`, {
				credentials: 'include'
			});
			if (!response.ok) return null;
			return handleResponse(response);
		} catch {
			return null;
		}
	}
};