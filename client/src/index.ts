import { Router } from './router';

document.addEventListener('DOMContentLoaded', () => {
	const app = document.getElementById('app');
	if (!app) throw new Error('App container not found');
	const router = new Router(app);
	router.handleRoute();
});