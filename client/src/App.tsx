import { useEffect, useRef } from 'react';
import { Router } from './router';

function App() {
	const containerRef = useRef<HTMLDivElement>(null);
	const routerRef = useRef<Router | null>(null);
	const initializedRef = useRef(false);

	useEffect(() => {
		if (containerRef.current && !initializedRef.current) {
			initializedRef.current = true;
			routerRef.current = new Router(containerRef.current);
			routerRef.current.handleRoute();
		}
	}, []);

	return <div ref={containerRef} style={{ width: '100%', minHeight: '100vh' }} />;
}

export default App;
