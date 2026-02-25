import { createContext, useState, useEffect } from "react";
const API_BASE = import.meta.env.VITE_API_BASE || 'https://juniper-fractus-dorethea.ngrok-free.dev/api';

export const PageState = createContext();
export function PageStateProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(() => {
		const saved =
			localStorage.getItem("currentUser") ||
			sessionStorage.getItem("currentUser");
		return saved ? JSON.parse(saved) : null;
	});
	const [books, setBooks] = useState([]);
	const [pages, setPages] = useState([]);
	const loginUser = (user) => setCurrentUser(user);
	const logoutUser = () => setCurrentUser(null);
	useEffect(() => {
		const saved =
			localStorage.getItem('currentUser') ||
			sessionStorage.getItem('currentUser');
		saved ? setCurrentUser(JSON.parse(saved)) : null;
	}, []);
	useEffect(() => {
	const raw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
	const savedUser = raw ? JSON.parse(raw) : null;
	const uid = savedUser?.id || savedUser?.userid;
	uid ? fetch(`${API_BASE}/me.php?id=${uid}`)
		.then(res => res.ok ? res.json() : Promise.reject())
		.then(actualUser => {
			setCurrentUser(actualUser);
			localStorage.setItem('currentUser', JSON.stringify(actualUser));
		})
		.catch(() => console.log("Сессия не подтверждена базой")) : null;
}, []);

useEffect(() => {
	const uid = currentUser?.id || currentUser?.userid;
	if (!uid) return;
	const url = `${API_BASE}/getBooks.php?user_id=${uid}`;
	fetch(url)
			.then(res => {
				if (!res.ok) return Promise.reject(res);
				const ct = (res.headers.get('content-type') || '').toLowerCase();
				if (ct.includes('application/json')) return res.json();
				return res.text().then(() => Promise.reject(new Error('NON_JSON')));
			})
			.then(data => {
				const raw = Array.isArray(data) ? data : [];
				const userBooks = raw.map(b => {
					const book = Object.assign({}, b);
					book.id = book.id ?? book.ID ?? book.book_id ?? book.bookId ?? null;
					book.user_id = book.user_id ?? book.userid ?? book.userId ?? book.user ?? null;
					book.title = book.title ?? book.name ?? '';
					book.author = book.author ?? book.writer ?? '';
					book.year = book.year ? Number(book.year) : 0;
					book.pages = book.pages ? Number(book.pages) : 0;
					book.rating = book.rating ?? book.mark ?? 0;
					book.finished = book.finished ? Boolean(Number(book.finished)) : false;
					book.read_status = book.read_status ?? book.readStatus ?? 0;
					return book;
				});
				setBooks(userBooks);
				const pagePromises = userBooks.map(b => fetch(`${API_BASE}/getPages.php?book_id=${b.id}`).then(r => r.ok ? r.json() : []));
				return Promise.all(pagePromises);
			})
		.then(pagesArrays => {
			const allPages = (pagesArrays || []).flat();
			setPages(allPages);
		})
				.catch(() => {
				const fallbackUrl = url.replace(/https?:\/\/[^/]+\/api/, 'http://localhost/api');
					fetch(fallbackUrl)
						.then(r => r.ok ? r.json() : Promise.reject(r))
						.then(data => {
						const raw = Array.isArray(data) ? data : [];
						const userBooks = raw.map(b => {
							const book = Object.assign({}, b);
							book.id = book.id ?? book.ID ?? book.book_id ?? book.bookId ?? null;
							book.user_id = book.user_id ?? book.userid ?? book.userId ?? book.user ?? null;
							book.title = book.title ?? book.name ?? '';
							book.author = book.author ?? book.writer ?? '';
							book.year = book.year ? Number(book.year) : 0;
							book.pages = book.pages ? Number(book.pages) : 0;
							book.rating = book.rating ?? book.mark ?? 0;
							book.finished = book.finished ? Boolean(Number(book.finished)) : false;
							book.read_status = book.read_status ?? book.readStatus ?? 0;
							return book;
						});
						setBooks(userBooks);
						const pagePromises = userBooks.map(b => fetch(`${fallbackUrl.replace(/getBooks.php.*$/, '')}getPages.php?book_id=${b.id}`).then(r => r.ok ? r.json() : []));
							return Promise.all(pagePromises);
						})
						.then(pagesArrays => {
							const allPages = (pagesArrays || []).flat();
							setPages(allPages);
						})
						.catch(() => {
							setBooks([]);
							setPages([]);
						});
				});
}, [currentUser]);
	useEffect(() => {
		currentUser ? localStorage.setItem('currentUser', JSON.stringify(currentUser)) : localStorage.removeItem('currentUser');
	}, [currentUser]);
	return (
		<PageState.Provider value={{ currentUser, setCurrentUser, loginUser, logoutUser, books, setBooks, pages, setPages }}>
			{children}
		</PageState.Provider>
	);
}