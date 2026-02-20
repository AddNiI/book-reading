import { createContext, useEffect, useState, useRef } from "react";

export const LoginsState = createContext();
export function LoginsStateProvider({ children }) {
    const API = 'https://699800f6d66520f95f1643e2.mockapi.io/users';
    const [users, setUsersState] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const initializedRef = useRef(false);
    const syncingRef = useRef(false);

    const mapServerUsers = (arr) => arr.map(u => ({ ...u, userid: u.id }));

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch(API);
                const data = await res.json();
                if (!mounted) return;
                setUsersState(mapServerUsers(data));
            } catch (e) {
                setUsersState([]);
            } finally {
                initializedRef.current = true;
            }
        })();
        const saved = localStorage.getItem('currentUser');
        if (saved) setCurrentUser(JSON.parse(saved));
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
        else localStorage.removeItem('currentUser');
    }, [currentUser]);

    const fetchAll = async () => {
        try {
            const r = await fetch(API);
            const d = await r.json();
            syncingRef.current = true;
            setUsersState(mapServerUsers(d));
        } finally {
            syncingRef.current = false;
        }
    };

    const syncUsers = async (prev, next) => {
        if (!initializedRef.current || syncingRef.current) return;
        try {
            const prevMap = new Map(prev.map(p => [String(p.userid ?? p.id), p]));
            const nextMap = new Map(next.map(n => [String(n.userid ?? n.id), n]));

            for (const n of next) {
                const key = String(n.userid ?? n.id ?? '');
                if (!key || !prevMap.has(key)) {
                    const payload = { ...n };
                    delete payload.userid;
                    await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }

            for (const p of prev) {
                const key = String(p.userid ?? p.id ?? '');
                if (key && !nextMap.has(key)) {
                    await fetch(`${API}/${key}`, { method: 'DELETE' });
                }
            }

            for (const n of next) {
                const key = String(n.userid ?? n.id ?? '');
                if (key && prevMap.has(key)) {
                    const prevItem = prevMap.get(key);
                    if (JSON.stringify(prevItem) !== JSON.stringify(n)) {
                        const payload = { ...n };
                        delete payload.userid;
                        await fetch(`${API}/${key}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    }
                }
            }
        } finally {
            await fetchAll();
        }
    };

    const setUsers = (updater) => {
        setUsersState(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            if (initializedRef.current && !syncingRef.current) syncUsers(prev, next);
            return next;
        });
    };

    const loginUser = (user) => setCurrentUser(user);
    const logoutUser = () => setCurrentUser(null);

    return (
        <LoginsState.Provider value={{ users, setUsers, currentUser, setCurrentUser, loginUser, logoutUser }}>
            {children}
        </LoginsState.Provider>
    );
}