import { createContext, useState, useEffect } from "react";

export const PagesState = createContext();
export function PagesStateProvider({ children }) {
    const [pages, setPages] = useState(() => {
        const isSaved = localStorage.getItem('pages');
        return isSaved ? JSON.parse(isSaved) : [
            /* { date: '', time: '', pages: '', userid}, */
    ]});
    useEffect(() => {
        localStorage.setItem('pages', JSON.stringify(pages));
    }, [pages]);
    return (
        <PagesState.Provider value={{ pages, setPages }}>
            {children}
        </PagesState.Provider>
    );
};