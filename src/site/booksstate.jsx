import { createContext, useState, useEffect, useRef } from "react";

export const BooksState = createContext();
export function BooksStateProvider({ children }) {
    const API = 'https://6997ffacd66520f95f1640b4.mockapi.io/books';
    const [books, setBooksState] = useState([]);
    const initializedRef = useRef(false);
    const syncingRef = useRef(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch(API);
                const data = await res.json();
                !mounted ? null : setBooksState(data);
            } catch (e) {
                setBooksState([]);
            } finally {
                initializedRef.current = true;
            }
        })();
        return () => { mounted = false; };
    }, []);

    const fetchAll = async () => {
        try {
            const r = await fetch(API);
            const d = await r.json();
            syncingRef.current = true;
            setBooksState(d);
        } finally {
            syncingRef.current = false;
        }
    };

    const syncBooks = async (prev, next) => {
        if (!initializedRef.current || syncingRef.current) return;
        try {
            const prevMap = new Map(prev.map(p => [String(p.id), p]));
            const nextMap = new Map(next.map(n => [String(n.id), n]));

            for (const n of next) {
                const key = String(n.id ?? '');
                if (!key || !prevMap.has(key)) {
                    const payload = { ...n };
                    delete payload.id;
                    await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                }
            }

            for (const p of prev) {
                const key = String(p.id ?? '');
                if (key && !nextMap.has(key)) {
                    await fetch(`${API}/${key}`, { method: 'DELETE' });
                }
            }

            for (const n of next) {
                const key = String(n.id ?? '');
                if (key && prevMap.has(key)) {
                    const prevItem = prevMap.get(key);
                    if (JSON.stringify(prevItem) !== JSON.stringify(n)) {
                        const payload = { ...n };
                        delete payload.id;
                        await fetch(`${API}/${key}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    }
                }
            }
        } finally {
            await fetchAll();
        }
    };

    const setBooks = (updater) => {
        setBooksState(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            initializedRef.current && !syncingRef.current ? syncBooks(prev, next) : null;
            return next;
        });
    };

    return (
        <BooksState.Provider value={{ books, setBooks }}>
            {children}
        </BooksState.Provider>
    );
};