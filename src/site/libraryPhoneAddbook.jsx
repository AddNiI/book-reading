import  { useContext, useState, useRef } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE;
import { PageState } from './pagestate';
import { Link } from 'react-router-dom';

function LibraryPhoneAddbook() {
    const [focused1, setFocused1] = useState(false);
    const [focused2, setFocused2] = useState(false);
    const [focused3, setFocused3] = useState(false);
    const [focused4, setFocused4] = useState(false);
    const { currentUser, setCurrentUser, setBooks } = useContext(PageState);
    const name = (currentUser && typeof currentUser.name === 'string') ? currentUser.name : '';
    const firstLetter = name.trim().charAt(0).toUpperCase();
    const uid = currentUser?.id || currentUser?.userid; 
    const [library, setLibrary] = useState({ title: '', author: '', year: '', pages: '' });
    const onChange = (value, name) => setLibrary(prev => ({...prev, [name]: value}));
    const submitDataBook = async () => {
        const { title, author, year, pages } = library;
        try {
            const res = await fetch(`${API_BASE}/addBook.php`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({ 
                    title: title, 
                    author: author, 
                    year: year ? parseInt(year) : 0, 
                    pages: pages ? parseInt(pages) : 0, 
                    user_id: uid 
                })
            });
            if (!res.ok) {
                const err = await res.text();
                return alert('Помилка сервера: ' + err);
            }
            const url = `${API_BASE}/getBooks.php?user_id=${uid}`;
            await fetch(url, {
                headers: {
                    "ngrok-skip-browser-warning": "true"
                }
            })
                .then(r => r.ok ? r.json() : Promise.reject('getBooks failed'))
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
                    setBooks ? setBooks(userBooks) : null;
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
                            setBooks ? setBooks(userBooks) : null;
                        })
                        .catch(() => {});
                });
            setLibrary({ title: '', author: '', year: '', pages: '' });
            alert('Книгу додано');
        } catch (err) { alert('Помилка мережі'); }
    };
    return (
        <>
            <header style={{padding: '12px 15px', gridTemplateColumns: '1fr auto 1fr', boxShadow: '0 2px 2px #091E3F1A', backgroundColor: '#FFF', display: 'grid', alignItems: 'center', position: 'fixed', width: 'calc(100vw - 30px)', zIndex: 100}}>
                <p style={{fontFamily: '"Abril Fatface", serif', fontWeight: 400, margin: '0', justifyContent: 'start'}}>BR</p>
                <div style={{justifyContent: 'center', display: 'flex', alignItems: 'center'}}>
                </div>
                <div style={{justifyContent: 'end', display: 'flex', height: '36px'}}>
                    <Link to="/training">
                        <div style={{width: 33,height: 33, borderRadius: '50%',background: '#F5F7FA', margin: '0 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0.5C18.89 0.15 17.67 0 16.5 0C14.55 0 12.45 0.4 11 1.5C9.55 0.4 7.45 0 5.5 0C3.55 0 1.45 0.4 0 1.5V16.15C0 16.4 0.25 16.65 0.5 16.65C0.6 16.65 0.65 16.6 0.75 16.6C2.1 15.95 4.05 15.5 5.5 15.5C7.45 15.5 9.55 15.9 11 17C12.35 16.15 14.8 15.5 16.5 15.5C18.15 15.5 19.85 15.8 21.25 16.55C21.35 16.6 21.4 16.6 21.5 16.6C21.75 16.6 22 16.35 22 16.1V1.5C21.4 1.05 20.75 0.75 20 0.5ZM20 14C18.9 13.65 17.7 13.5 16.5 13.5C14.8 13.5 12.35 14.15 11 15V3.5C12.35 2.65 14.8 2 16.5 2C17.7 2 18.9 2.15 20 2.5V14Z" fill="#A6ABB9"/>
                                <path d="M16.5 6C17.38 6 18.23 6.09 19 6.26V4.74C18.21 4.59 17.36 4.5 16.5 4.5C14.8 4.5 13.26 4.79 12 5.33V6.99C13.13 6.35 14.7 6 16.5 6Z" fill="#A6ABB9"/>
                                <path d="M12 7.99016V9.65016C13.13 9.01016 14.7 8.66016 16.5 8.66016C17.38 8.66016 18.23 8.75016 19 8.92016V7.40016C18.21 7.25016 17.36 7.16016 16.5 7.16016C14.8 7.16016 13.26 7.46016 12 7.99016Z" fill="#A6ABB9"/>
                                <path d="M16.5 9.83008C14.8 9.83008 13.26 10.1201 12 10.6601V12.3201C13.13 11.6801 14.7 11.3301 16.5 11.3301C17.38 11.3301 18.23 11.4201 19 11.5901V10.0701C18.21 9.91008 17.36 9.83008 16.5 9.83008Z" fill="#A6ABB9"/>
                            </svg>
                        </div>
                    </Link>
                    <Link to="/library">
                        <svg style={{margin: '8px 11px 8px 14px'}} width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 2.69L15 7.19V15H13V9H7V15H5V7.19L10 2.69ZM10 0L0 9H3V17H9V11H11V17H17V9H20L10 0Z" fill="#A6ABB9"/>
                        </svg>
                    </Link>
                    <svg width="2" height="33" viewBox="0 0 1 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0.5" y1="-2.18557e-08" x2="0.500001" y2="33" stroke="#E0E5EB"/>
                    </svg>
                    <div style={{width: 33,height: 33,borderRadius: '50%',background: '#F5F7FA', margin: '0 0 0 14px',display: 'inline-flex',alignItems: 'center',justifyContent: 'center'}}><p style={{margin:'0', fontFamily: '"Montserrat", serif', fontWeight: 600, color: '#242A37'}}>{firstLetter}</p></div>
                    <Link to="/login">
                        <p onClick={()=>{localStorage.removeItem("currentUser"), setCurrentUser(null)}} style={{fontFamily: '"Montserrat", serif', fontWeight: 300, color: '#242A37', margin: '7px 13px 0 14px', textDecoration: 'underline'}}>Вихiд</p>
                    </Link>
                </div>
            </header>
            <main style={{backgroundColor: '#F6F7FB', minHeight: '100vh', height: '100%', paddingTop: '60px'}}>
                <Link to='/library' style={{cursor: 'pointer', margin: '0 auto 0 25px'}}>
                    <svg width="24" height="12" style={{marginTop: '25px'}} viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.274948 6.47611C0.275228 6.47639 0.275463 6.47672 0.275791 6.477L5.17442 11.352C5.54141 11.7172 6.13498 11.7158 6.50028 11.3488C6.86553 10.9818 6.86412 10.3883 6.49714 10.023L3.2082 6.75L23.0625 6.75C23.5803 6.75 24 6.33028 24 5.8125C24 5.29472 23.5803 4.875 23.0625 4.875L3.20825 4.875L6.49709 1.602C6.86408 1.23675 6.86548 0.643171 6.50023 0.276187C6.13494 -0.0908922 5.54131 -0.0921577 5.17437 0.273L0.275745 5.148C0.275463 5.14828 0.275228 5.14861 0.2749 5.14889C-0.0922723 5.51536 -0.0910993 6.11086 0.274948 6.47611Z" fill="#FF6B08"/>
                    </svg>
                </Link>
                <div style={{fontFamily: '"Montserrat", serif', fontWeight: 500, color: '#898F9F'}}>
                    <p style={{margin: '29px auto 0 25px'}}>Назва книги</p>
                    <input onFocus={() => setFocused1(true)} onBlur={() => setFocused1(false)} value={library.title} onChange={e => onChange(e.target.value, 'title')} placeholder='...' style={{outline: 'none',fontWeight: 400, color: '#A6ABB9', backgroundColor: focused1 ? '#fff' : '#F6F7FB', border: focused1 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', margin: '14px 25px 23px', width: focused1 ? 'calc(100vw - 63px)' : 'calc(100vw - 65px)', height: focused1 ? '44px' : '42px', boxShadow: focused1 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}} />
                    <p style={{margin: '0 auto 0 25px'}}>Автор книги</p>
                    <input onFocus={() => setFocused2(true)} onBlur={() => setFocused2(false)} value={library.author} onChange={e => onChange(e.target.value, 'author')} placeholder='...' style={{outline: 'none', fontWeight: 400, color: '#A6ABB9', backgroundColor: focused2 ? '#fff' : '#F6F7FB', border: focused2 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', margin: '14px 25px 23px', width: focused2 ? 'calc(100vw - 63px)' : 'calc(100vw - 65px)', height: focused2 ? '44px' : '42px', boxShadow: focused2 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}} />
                    <p style={{margin: '0 auto 0 25px'}}>Рiк видання</p>
                    <input onFocus={() => setFocused3(true)} onBlur={() => setFocused3(false)} type='number' value={library.year} onChange={e => onChange(e.target.value, 'year')} placeholder='...' style={{outline: 'none', fontWeight: 400, color: '#A6ABB9', backgroundColor: focused3 ? '#fff' : '#F6F7FB', border: focused3 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', margin: '14px 25px 23px', width: focused3 ? 'calc(100vw - 63px)' : 'calc(100vw - 65px)', height: focused3 ? '44px' : '42px', boxShadow: focused3 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}} />
                    <p style={{margin: '0 auto 0 25px'}}>Кiлькiсть сторiнок</p>
                    <input onFocus={() => setFocused4(true)} onBlur={() => setFocused4(false)} type='number' value={library.pages} onChange={e => onChange(e.target.value, 'pages')} placeholder='...' style={{outline: 'none', fontWeight: 400, color: '#A6ABB9', backgroundColor: focused4 ? '#fff' : '#F6F7FB', border: focused4 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', margin: '14px 25px 35px', width: focused4 ? 'calc(100vw - 63px)' : 'calc(100vw - 65px)', height: focused4 ? '44px' : '42px', boxShadow: focused4 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}}/>
                    <button onClick={submitDataBook} style={{cursor: 'pointer', backgroundColor: "#F6F7FB", border: '1px solid #242A37', width: '171px', height: '42px', marginLeft: 'calc(50vw - 85.5px)'}}>Додати</button>
                </div>
            </main>
        </>
    )
}

export default LibraryPhoneAddbook;