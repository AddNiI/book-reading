import { createContext, useState, useEffect } from "react";

export const BooksState = createContext();
export function BooksStateProvider({ children }) {
    const [books, setBooks] = useState(() => {
        const isSaved = localStorage.getItem('books');
        return isSaved ? JSON.parse(isSaved) : [
            { whatuserid: 1, id: 1, bookname: 'Test Book', author: "Tst", year: '2000', pages: "100", mark: 0, read: true, finished: false, review: ''},
            { whatuserid: 1, id: 2, bookname: 'Test Book 2', author: "Tst", year: '2100', pages: "7000", mark: 0, read: false, finished: false, review: ''},
            { whatuserid: 1, id: 3, bookname: 'Test Book 3', author: "Tst", year: '900', pages: "30", mark: 5, read: true, finished: true, review: ''},
            { whatuserid: 1, id: 4, bookname: 'Test Book 4', author: "Tst", year: '-20', pages: "309", mark: 2, read: true, finished: true, review: ''},
            { whatuserid: 2, id: 5, bookname: 'Test Book 5', author: "Tst", year: '90', pages: "3", mark: 2, read: true, finished: true, review: ''},
            { whatuserid: 1, id: 6, bookname: 'Test Book 6', author: "Tst", year: '-2000', pages: "89", mark: 0, read: true, finished: true, review: ''},
            { whatuserid: 4, id: 7, bookname: 'Test Book 6', author: "Tst", year: '-2000', pages: "5", mark: 0, read: true, finished: false, review: ''},
    ]});
    useEffect(() => {
        localStorage.setItem('books', JSON.stringify(books));
    }, [books]);
    return (
        <BooksState.Provider value={{ books, setBooks }}>
            {children}
        </BooksState.Provider>
    );
};