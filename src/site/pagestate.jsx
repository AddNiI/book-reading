import { createContext, useState, useEffect, useRef } from "react";

export const PageState = createContext();
export function PageStateProvider({ children }) {
	const API_PAGES = 'https://6997ffacd66520f95f1640b4.mockapi.io/pages';
	const API_BOOKS = 'https://6997ffacd66520f95f1640b4.mockapi.io/books';
	const API_USERS = 'https://699800f6d66520f95f1643e2.mockapi.io/users';

	const [pages, setPagesState] = useState([]);
	const [books, setBooksState] = useState([]);
	const [users, setUsersState] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);

	const pagesInitialized = useRef(false);
	const pagesSyncing = useRef(false);
	const booksInitialized = useRef(false);
	const booksSyncing = useRef(false);
	const usersInitialized = useRef(false);
	const usersSyncing = useRef(false);

	/* Pages */
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const res = await fetch(API_PAGES);
				const data = await res.json();
				!mounted ? null : setPagesState(data);
			} catch (e) {
				setPagesState([]);
			} finally {
				pagesInitialized.current = true;
			}
		})();
		return () => { mounted = false; };
	}, []);

	const fetchAllPages = async () => {
		try {
			const r = await fetch(API_PAGES);
			const d = await r.json();
			pagesSyncing.current = true;
			setPagesState(d);
		} finally {
			pagesSyncing.current = false;
		}
	};

	const syncPages = async (prev, next) => (!pagesInitialized.current || pagesSyncing.current)
		? undefined
		: (async () => {
			try {
				const prevMap = new Map(prev.map(p => [String(p.id), p]));
				const nextMap = new Map(next.map(n => [String(n.id), n]));

				for (const n of next) {
					const key = String(n.id ?? '');
					await ((!key || !prevMap.has(key))
						? (async () => { const payload = { ...n }; delete payload.id; await fetch(API_PAGES, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); })()
						: null);
				}

				for (const p of prev) {
					const key = String(p.id ?? '');
					await ((key && !nextMap.has(key))
						? (async () => { await fetch(`${API_PAGES}/${key}`, { method: 'DELETE' }); })()
						: null);
				}

				for (const n of next) {
					const key = String(n.id ?? '');
					await ((key && prevMap.has(key))
						? (async () => {
							const prevItem = prevMap.get(key);
							await (JSON.stringify(prevItem) !== JSON.stringify(n)
								? (async () => { const payload = { ...n }; delete payload.id; await fetch(`${API_PAGES}/${key}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); })()
								: null);
						})()
						: null);
				}
			} finally {
				await fetchAllPages();
			}
		})();

	const setPages = (updater) => {
		setPagesState(prev => {
			const next = typeof updater === 'function' ? updater(prev) : updater;
			pagesInitialized.current && !pagesSyncing.current ? syncPages(prev, next) : null;
			return next;
		});
	};

	/* Books */
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const res = await fetch(API_BOOKS);
				const data = await res.json();
				!mounted ? null : setBooksState(data);
			} catch (e) {
				setBooksState([]);
			} finally {
				booksInitialized.current = true;
			}
		})();
		return () => { mounted = false; };
	}, []);

	const fetchAllBooks = async () => {
		try {
			const r = await fetch(API_BOOKS);
			const d = await r.json();
			booksSyncing.current = true;
			setBooksState(d);
		} finally {
			booksSyncing.current = false;
		}
	};

	const syncBooks = async (prev, next) => (!booksInitialized.current || booksSyncing.current)
		? undefined
		: (async () => {
			try {
				const prevMap = new Map(prev.map(p => [String(p.id), p]));
				const nextMap = new Map(next.map(n => [String(n.id), n]));

				for (const n of next) {
					const key = String(n.id ?? '');
					await ((!key || !prevMap.has(key))
						? (async () => { const payload = { ...n }; delete payload.id; await fetch(API_BOOKS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); })()
						: null);
				}

				for (const p of prev) {
					const key = String(p.id ?? '');
					await ((key && !nextMap.has(key))
						? (async () => { await fetch(`${API_BOOKS}/${key}`, { method: 'DELETE' }); })()
						: null);
				}

				for (const n of next) {
					const key = String(n.id ?? '');
					await ((key && prevMap.has(key))
						? (async () => {
							const prevItem = prevMap.get(key);
							await (JSON.stringify(prevItem) !== JSON.stringify(n)
								? (async () => { const payload = { ...n }; delete payload.id; await fetch(`${API_BOOKS}/${key}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); })()
								: null);
						})()
						: null);
				}
			} finally {
				await fetchAllBooks();
			}
		})();

	const setBooks = (updater) => {
		setBooksState(prev => {
			const next = typeof updater === 'function' ? updater(prev) : updater;
			booksInitialized.current && !booksSyncing.current ? syncBooks(prev, next) : null;
			return next;
		});
	};

	/* Users / Logins */
	const mapServerUsers = (arr) => arr.map(u => ({ ...u, userid: u.id }));

	useEffect(() => {
		let mounted = true;
		(async () => {
				try {
					const res = await fetch(API_USERS);
					const data = await res.json();
					!mounted ? null : setUsersState(mapServerUsers(data));
				} catch (e) {
					setUsersState([]);
				} finally {
					usersInitialized.current = true;
				}
		})();
		const saved = localStorage.getItem('loggedUser') || sessionStorage.getItem('loggedUser') || localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
		saved ? setCurrentUser(JSON.parse(saved)) : null;
		return () => { mounted = false; };
	}, []);

	useEffect(() => {
		currentUser ? localStorage.setItem('currentUser', JSON.stringify(currentUser)) : localStorage.removeItem('currentUser');
	}, [currentUser]);

	const fetchAllUsers = async () => {
		try {
			const r = await fetch(API_USERS);
			const d = await r.json();
			usersSyncing.current = true;
			setUsersState(mapServerUsers(d));
		} finally {
			usersSyncing.current = false;
		}
	};

	const syncUsers = async (prev, next) => (!usersInitialized.current || usersSyncing.current)
		? undefined
		: (async () => {
			try {
				const prevMap = new Map(prev.map(p => [String(p.userid ?? p.id), p]));
				const nextMap = new Map(next.map(n => [String(n.userid ?? n.id), n]));

				for (const n of next) {
					const key = String(n.userid ?? n.id ?? '');
					await ((!key || !prevMap.has(key))
						? (async () => { const payload = { ...n }; delete payload.userid; await fetch(API_USERS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); })()
						: null);
				}

				for (const p of prev) {
					const key = String(p.userid ?? p.id ?? '');
					await ((key && !nextMap.has(key))
						? (async () => { await fetch(`${API_USERS}/${key}`, { method: 'DELETE' }); })()
						: null);
				}

				for (const n of next) {
					const key = String(n.userid ?? n.id ?? '');
					await ((key && prevMap.has(key))
						? (async () => {
							const prevItem = prevMap.get(key);
							await (JSON.stringify(prevItem) !== JSON.stringify(n)
								? (async () => { const payload = { ...n }; delete payload.userid; await fetch(`${API_USERS}/${key}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); })()
								: null);
						})()
						: null);
				}
			} finally {
				await fetchAllUsers();
			}
		})();

	const setUsers = (updater) => {
		setUsersState(prev => {
			const next = typeof updater === 'function' ? updater(prev) : updater;
			usersInitialized.current && !usersSyncing.current ? syncUsers(prev, next) : null;
			return next;
		});
	};

	const loginUser = (user) => setCurrentUser(user);
	const logoutUser = () => setCurrentUser(null);

	return (
		<PageState.Provider value={{ pages, setPages, books, setBooks, users, setUsers, currentUser, setCurrentUser, loginUser, logoutUser }}>
			{children}
		</PageState.Provider>
	);
}
