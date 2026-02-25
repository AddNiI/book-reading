import { createContext, useState, useEffect } from "react";

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
	uid ? fetch(`http://localhost/api/me.php?id=${uid}`)
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
	fetch(`http://localhost/api/getBooks.php?user_id=${uid}`)
		.then(res => res.ok ? res.json() : Promise.reject())
		.then(data => {
			const userBooks = Array.isArray(data) ? data : [];
			setBooks(userBooks);
			const pagePromises = userBooks.map(b => fetch(`http://localhost/api/getPages.php?book_id=${b.id}`).then(r => r.ok ? r.json() : []));
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