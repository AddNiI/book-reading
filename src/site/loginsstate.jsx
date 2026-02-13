import { createContext, useEffect, useState } from "react";

export const LoginsState = createContext();
export function LoginsStateProvider({ children }) {
    const [users, setUsers] = useState(() => {
        const isSaved = localStorage.getItem('users');
        return isSaved ? JSON.parse(isSaved) : [
            { userid: 1, name: 'Test', email: "testificate@test.com", password: "12345678", training: false, finishDate: '2026-02-17', readDays: ''},
        ];
    });
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });
    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);
    useEffect(() => {
        if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
        else localStorage.removeItem('currentUser');
    }, [currentUser]);
    const loginUser = (user) => setCurrentUser(user);
    const logoutUser = () => setCurrentUser(null);
    return (
        <LoginsState.Provider value={{ users, setUsers, currentUser, setCurrentUser, loginUser, logoutUser }}>
            {children}
        </LoginsState.Provider>
    );
}