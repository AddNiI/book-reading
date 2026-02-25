import  React,{ useContext, useState, useEffect } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://juniper-fractus-dorethea.ngrok-free.dev/api';
import { Link } from 'react-router-dom';
import { PageState } from './pagestate.jsx';
const StarEmpty = ({ keyProp }) => (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" key={keyProp}>
        <path d="M9.5166 6.02832L9.62891 6.37305H14.6289L10.8779 9.09863L10.584 9.3125L10.6963 9.6582L12.1279 14.0664L8.37793 11.3418L8.08398 11.1289L7.79004 11.3418L4.03906 14.0664L5.47168 9.6582L5.58398 9.3125L5.29004 9.09863L1.53906 6.37305H6.53906L6.65137 6.02832L8.08398 1.61816L9.5166 6.02832Z" stroke="#FF6B08"/>
    </svg>
);
const StarEmptyGray = ({ keyProp }) => (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" key={keyProp}>
        <path d="M9.5166 6.02832L9.62891 6.37305H14.6289L10.8779 9.09863L10.584 9.3125L10.6963 9.6582L12.1279 14.0664L8.37793 11.3418L8.08398 11.1289L7.79004 11.3418L4.03906 14.0664L5.47168 9.6582L5.58398 9.3125L5.29004 9.09863L1.53906 6.37305H6.53906L6.65137 6.02832L8.08398 1.61816L9.5166 6.02832Z" stroke="#A6ABB9"/>
    </svg>
);
const StarFilled = ({ keyProp }) => (
    <svg width="17" height="16" viewBox="0 0 17 16" xmlns="http://www.w3.org/2000/svg" key={keyProp}>
      <path d="M8.08398 0L9.99235 5.87336L16.168 5.87336L11.1718 9.50329L13.0802 15.3766L8.08398 11.7467L3.08781 15.3766L4.99618 9.50329L3.8147e-06 5.87336L6.17562 5.87336L8.08398 0Z" fill="#FF6B08"/>
    </svg>
);
const Stars = ({ value = 0 }) => (
    <div style={{display: 'flex', gap: 8}}>
        {[1,2,3,4,5].map(n => (
            n <= value
                ? <StarFilled key={n} keyProp={n} />
                : (value === 0
                    ? <StarEmptyGray key={n} keyProp={n} />
                    : <StarEmpty key={n} keyProp={n} />
                )
        ))}
    </div>
);
function Modal({ initialMark = 0, initialReview = '', onClose, onSave }) {
    const [rating, setRating] = useState(Number(initialMark) || 0);
    const [localReview, setLocalReview] = useState(initialReview || '');
    const [touched, setTouched] = useState(Boolean(Number(initialMark) > 0));
    const setMark = (e) => {
        const newMark = Number(e.currentTarget.dataset.value || 0);
        setRating(newMark);
        setTouched(true);
    };
    return (
        <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center'}} >
            <div onClick={e => e.stopPropagation()} style={{background:'#fff', width: '510px', height: '348px', padding: '30px', borderRadius: '6px '}}>
                <p style={{margin: '0 0 15px'}}>Обрати рейтинг книги</p>
                <div style={{display: 'flex'}}>
                    {[1,2,3,4,5].map(n => (
                        <button key={n} data-value={n} onClick={setMark} style={{background:'transparent', border: '0', padding: '0', cursor: 'pointer'}}>
                            {n <= rating
                                ? <StarFilled keyProp={n} />
                                : (!touched && rating === 0)
                                    ? <StarEmptyGray keyProp={n} />
                                    : <StarEmpty keyProp={n} />
                            }
                        </button>
                    ))}
                </div>
                <p style={{margin: '10px 0 0'}}>Резюме</p>
                <textarea value={localReview} onChange={e => setLocalReview(e.target.value)} style={{resize: 'none', width:'100%', boxSizing:'border-box', margin: '12px 0 15px 0', width: '510px', height: '174px', whiteSpace: 'pre-wrap'}} />
                <div style={{display:'flex', gap:8, marginTop:12}}>
                    <button onClick={onClose} style={{backgroundColor: "#fff", border: '1px solid #242A37', width: '130px', height: '40px', margin: '0 30px 0 110px', cursor: 'pointer'}}>Назад</button>
                    <button onClick={() => { onSave ? onSave(rating, localReview) : null; }} style={{color: '#fff', backgroundColor: '#FF6B08', border: '0', fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: '15px', padding: '11px 28px', cursor: 'pointer'}}>Зберегти</button>
                </div>
            </div>
        </div>
    );
}
function Library() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [focused1, setFocused1] = useState(false);
    const [focused2, setFocused2] = useState(false);
    const [focused3, setFocused3] = useState(false);
    const [focused4, setFocused4] = useState(false);
    const { currentUser, setCurrentUser, books, setBooks } = useContext(PageState);
    const name = (currentUser && typeof currentUser.name === 'string') ? currentUser.name : '';
    const firstLetter = name.trim().charAt(0).toUpperCase();
    const uid = currentUser?.id || currentUser?.userid; 
        useEffect(() => {
            if (!uid) return;
            const url = `${API_BASE}/getBooks.php?user_id=${uid}`;
            fetch(url)
                .then(r => {
                    if (!r.ok) return Promise.reject(r);
                    const ct = (r.headers.get('content-type') || '').toLowerCase();
                    if (ct.includes('application/json')) return r.json();
                    return r.text().then(() => Promise.reject(new Error('NON_JSON')));
                })
                .then(data => setBooks ? setBooks(Array.isArray(data) ? data : []) : null)
                .catch(() => {
                    const fallbackUrl = url.replace(/https?:\/\/[^/]+\/api/, 'http://localhost/api');
                    fetch(fallbackUrl)
                        .then(r => r.ok ? r.json() : Promise.reject(r))
                        .then(data => setBooks ? setBooks(Array.isArray(data) ? data : []) : null)
                        .catch(() => {});
                });
        }, [uid, setBooks]);
    const wantread = [];
    const reading = [];
    const finish = [];
    const notbooks = [];
    const [library, setLibrary] = useState({ title: '', author: '', year: '', pages: '' });
    const onChange = (value, name) => setLibrary(prev => ({...prev, [name]: value}));
    const submitDataBook = async () => {
        const { title, author, year, pages } = library;
        try {
            const res = await fetch(`${API_BASE}/addBook.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            
            await fetch(`${API_BASE}/getBooks.php?user_id=${uid}`)
                .then(r => r.ok ? r.json() : Promise.reject('getBooks failed'))
                    .then(data => setBooks ? setBooks(Array.isArray(data) ? data : []) : null)
                .catch(() => {});
            
            setLibrary({ title: '', author: '', year: '', pages: '' });
            alert('Книгу додано');
        } catch (err) { alert('Помилка мережі'); }
    };
    books.forEach(book => {
        book.user_id == uid
            ? (book.finished ? finish.push(book) : (book.read_status ? reading.push(book) : wantread.push(book)))
            : notbooks.push(book);
    });
    return (
        <div>
            <header style={{padding: '13.5px 15px', gridTemplateColumns: '1fr auto 1fr', boxShadow: '0 2px 2px #091E3F1A', display: 'grid', alignItems: 'center'}}>
                <p style={{fontFamily: '"Abril Fatface", serif', fontWeight: 400, margin: '0', justifyContent: 'start'}}>BR</p>
                <div style={{justifyContent: 'center', display: 'flex', alignItems: 'center'}}>
                    <div style={{width: 33,height: 33,borderRadius: '50%',background: '#F5F7FA', margin: '0 12px 0 0',display: 'inline-flex',alignItems: 'center',justifyContent: 'center'}}><p style={{margin:'0', fontFamily: '"Montserrat", serif', fontWeight: 600, color: '#242A37'}}>{firstLetter}</p></div>
                    <p style={{fontFamily: '"Montserrat", serif', fontWeight: 300, color: '#242A37', margin: '0'}}>{name}</p>
                </div>
                <div style={{justifyContent: 'end', display: 'flex'}}>
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
                    <svg width="1" height="33" viewBox="0 0 1 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0.5" y1="-2.18557e-08" x2="0.500001" y2="33" stroke="#E0E5EB"/>
                    </svg>
                    <Link to="/login">
                        <p onClick={()=>{localStorage.removeItem("currentUser"), setCurrentUser(null)}} style={{fontFamily: '"Montserrat", serif', fontWeight: 300, color: '#242A37', margin: '7px 0 0 14px', textDecoration: 'underline'}}>Вихiд</p>
                    </Link>
                </div>
            </header>
            <main style={{backgroundColor: '#F6F7FB'}}>
                <div style={{fontFamily: '"Montserrat", serif', fontWeight: 500, color: '#898F9F'}}>
                    <div style={{display: 'flex'}}>
                        <p style={{margin: '42px 256px 14px calc(50% - 560px)'}}>Назва книги</p>
                        <p style={{margin: '42px 159px 14px 0'}}>Автор книги</p>
                        <p style={{margin: '42px 43px 14px 0'}}>Рiк видання</p>
                        <p style={{margin: '42px 0 14px'}}>Кiлькiсть сторiнок</p>
                    </div>
                    <input onFocus={() => setFocused1(true)} onBlur={() => setFocused1(false)} value={library.title} onChange={e => onChange(e.target.value, 'title')} placeholder='...' style={{outline: 'none',fontWeight: 400, color: '#A6ABB9', backgroundColor: focused1 ? '#fff' : '#F6F7FB', border: focused1 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', margin: '0 15px 0 calc(50% - 560px)', width:'331px', height: '42px', boxShadow: focused1 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}} />
                    <input onFocus={() => setFocused2(true)} onBlur={() => setFocused2(false)} value={library.author} onChange={e => onChange(e.target.value, 'author')} placeholder='...' style={{outline: 'none', fontWeight: 400, color: '#A6ABB9', backgroundColor: focused2 ? '#fff' : '#F6F7FB', border: focused2 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', margin: '0 15px 0 0', width:'235px', height: '42px', boxShadow: focused2 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}} />
                    <input onFocus={() => setFocused3(true)} onBlur={() => setFocused3(false)} type='number' value={library.year} onChange={e => onChange(e.target.value, 'year')} placeholder='...' style={{outline: 'none', fontWeight: 400, color: '#A6ABB9', backgroundColor: focused3 ? '#fff' : '#F6F7FB', border: focused3 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', margin: '0 15px 0 0', width:'115px', height: '42px', boxShadow: focused3 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}} />
                    <input onFocus={() => setFocused4(true)} onBlur={() => setFocused4(false)} type='number' value={library.pages} onChange={e => onChange(e.target.value, 'pages')} placeholder='...' style={{outline: 'none', fontWeight: 400, color: '#A6ABB9', backgroundColor: focused4 ? '#fff' : '#F6F7FB', border: focused4 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', margin: '0 45px 0 0', width:'119px', height: '42px', boxShadow: focused4 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}}/>
                    <button onClick={submitDataBook} style={{backgroundColor: "#F6F7FB", border: '1px solid #242A37', width: '171px', height: '42px'}}>Додати</button>
                </div>
                {isModalOpen && selectedBook && (
                    <Modal
                        initialMark={selectedBook.rating || selectedBook.mark}
                        initialReview={selectedBook.review}
                        onClose={() => { setIsModalOpen(false); setSelectedBook(null); }}
                        onSave={async (newMark, newReview) => {
                                    try {
                                        const res = await fetch(`${API_BASE}/updateBook.php`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ book_id: selectedBook.id, rating: newMark, review: newReview })
                                        });
                                        if (!res.ok) {
                                            const txt = await res.text();
                                            alert('Помилка сервера: ' + txt);
                                        } else {
                                            setBooks ? setBooks(prev => prev.map(b => b.id === selectedBook.id ? {...b, rating: newMark, review: newReview} : b)) : null;
                                            alert('Відгук та оцінку збережено');
                                        }
                                    } catch (err) {
                                        alert('Помилка мережі при збереженні');
                                    }
                                    setIsModalOpen(false);
                                    setSelectedBook(null);
                                }}
                    />
                )}
                {finish.length === 0 && reading.length === 0 && wantread.length === 0 ? (
                    <div>
                        <div style={{backgroundColor: '#fff', width: '510px', padding: '30px', fontFamily: '"Montserrat", serif', fontWeight: 600, color: '#242A37', margin: '42px 0 0 calc(50% - 285px)'}}>  
                            <p style={{color: '#242A37', margin: '0', fontSize: '19px'}}>Крок 1.</p>
                            <div style={{display: 'flex'}}>
                                <svg style={{margin: '12px 9px 0 0'}} width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 0.5C18.89 0.15 17.67 0 16.5 0C14.55 0 12.45 0.4 11 1.5C9.55 0.4 7.45 0 5.5 0C3.55 0 1.45 0.4 0 1.5V16.15C0 16.4 0.25 16.65 0.5 16.65C0.6 16.65 0.65 16.6 0.75 16.6C2.1 15.95 4.05 15.5 5.5 15.5C7.45 15.5 9.55 15.9 11 17C12.35 16.15 14.8 15.5 16.5 15.5C18.15 15.5 19.85 15.8 21.25 16.55C21.35 16.6 21.4 16.6 21.5 16.6C21.75 16.6 22 16.35 22 16.1V1.5C21.4 1.05 20.75 0.75 20 0.5ZM20 14C18.9 13.65 17.7 13.5 16.5 13.5C14.8 13.5 12.35 14.15 11 15V3.5C12.35 2.65 14.8 2 16.5 2C17.7 2 18.9 2.15 20 2.5V14Z" fill="#A6ABB9"/>
                                    <path d="M16.5 6C17.38 6 18.23 6.09 19 6.26V4.74C18.21 4.59 17.36 4.5 16.5 4.5C14.8 4.5 13.26 4.79 12 5.33V6.99C13.13 6.35 14.7 6 16.5 6Z" fill="#A6ABB9"/>
                                    <path d="M12 7.99003V9.65003C13.13 9.01003 14.7 8.66003 16.5 8.66003C17.38 8.66003 18.23 8.75003 19 8.92003V7.40003C18.21 7.25003 17.36 7.16003 16.5 7.16003C14.8 7.16003 13.26 7.46003 12 7.99003Z" fill="#A6ABB9"/>
                                    <path d="M16.5 9.82996C14.8 9.82996 13.26 10.12 12 10.66V12.32C13.13 11.68 14.7 11.33 16.5 11.33C17.38 11.33 18.23 11.42 19 11.59V10.07C18.21 9.90996 17.36 9.82996 16.5 9.82996Z" fill="#A6ABB9"/>
                                </svg> 
                                <p style={{margin: '11px 0 0 0', fontSize: '16px'}}>Створіть особисту бібліотеку</p>
                            </div>
                            <div style={{display: 'flex'}}>
                                <svg style={{margin: '11px 9px 0 31px'}} width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.59013 8.58096C8.56655 8.46653 8.47333 8.41332 8.40533 8.34181C7.91179 7.82059 7.41058 7.30395 6.91595 6.78217C6.70538 6.56075 6.68673 6.32446 6.85289 6.15625C7.01905 5.98805 7.25101 6.00292 7.4561 6.2169C8.24648 7.03658 9.03467 7.85854 9.82067 8.6828C10.062 8.93626 10.0592 9.11362 9.81574 9.36936C9.03632 10.1871 8.25489 11.0026 7.47145 11.8158C7.25539 12.0401 7.04372 12.0572 6.86824 11.8799C6.69276 11.7025 6.71909 11.4731 6.92747 11.2534C7.41607 10.7385 7.90905 10.2281 8.3982 9.71436C8.46674 9.64227 8.55722 9.58677 8.58519 9.47292C8.50787 9.39396 8.41245 9.43115 8.32746 9.43115C5.75121 9.42848 3.17387 9.42714 0.595428 9.42714C0.10683 9.42714 0.00318837 9.31615 0.00318841 8.80695C0.00318865 6.08054 0.00318889 3.35336 0.00318913 0.625427C-0.00296302 0.530019 -0.00020689 0.434213 0.0114165 0.33936C0.0530921 0.128244 0.181411 -0.00391569 0.391986 8.88054e-05C0.60256 0.00409426 0.72704 0.136828 0.765975 0.348517C0.775414 0.433781 0.777432 0.51976 0.772006 0.605405C0.772006 3.18001 0.775843 5.75461 0.767618 8.32636C0.767618 8.56951 0.833969 8.62616 1.0577 8.62501C3.47876 8.617 5.89982 8.62043 8.32088 8.61872C8.4141 8.62329 8.51007 8.65648 8.59013 8.58096Z" fill="#FF6B08"/>
                                </svg>
                                <p style={{color: '#898F9F', fontWeight: 400, margin: '11px 0 0', fontSize: '14px'}}>
                                    Додайте до неї книжки, які маєте намір прочитати.
                                </p>
                            </div>
                            <p style={{color: '#242A37', margin: '46px 0 0 0', fontSize: '19px'}}>Крок 2.</p>
                            <div style={{display: 'flex'}}>
                                <svg style={{margin: '18px 16px 0 0'}} width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.36 2L7.76 4H13V10H9.64L9.24 8H2V2H7.36ZM9 0H0V17H2V10H7.6L8 12H15V2H9.4L9 0Z" fill="#A6ABB9"/>
                                </svg>
                                <p style={{margin: '16px 0 0 0', fontSize: '16px'}}>Сформуйте своє перше тренування</p>
                            </div>
                            <div style={{display: 'flex'}}>
                                <svg style={{margin: '11px 9px 0 31px'}} width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.59013 8.58096C8.56655 8.46653 8.47333 8.41332 8.40533 8.34181C7.91179 7.82059 7.41058 7.30395 6.91595 6.78217C6.70538 6.56075 6.68673 6.32446 6.85289 6.15625C7.01905 5.98805 7.25101 6.00292 7.4561 6.2169C8.24648 7.03658 9.03467 7.85854 9.82067 8.6828C10.062 8.93626 10.0592 9.11362 9.81574 9.36936C9.03632 10.1871 8.25489 11.0026 7.47145 11.8158C7.25539 12.0401 7.04372 12.0572 6.86824 11.8799C6.69276 11.7025 6.71909 11.4731 6.92747 11.2534C7.41607 10.7385 7.90905 10.2281 8.3982 9.71436C8.46674 9.64227 8.55722 9.58677 8.58519 9.47292C8.50787 9.39396 8.41245 9.43115 8.32746 9.43115C5.75121 9.42848 3.17387 9.42714 0.595428 9.42714C0.10683 9.42714 0.00318837 9.31615 0.00318841 8.80695C0.00318865 6.08054 0.00318889 3.35336 0.00318913 0.625427C-0.00296302 0.530019 -0.00020689 0.434213 0.0114165 0.33936C0.0530921 0.128244 0.181411 -0.00391569 0.391986 8.88054e-05C0.60256 0.00409426 0.72704 0.136828 0.765975 0.348517C0.775414 0.433781 0.777432 0.51976 0.772006 0.605405C0.772006 3.18001 0.775843 5.75461 0.767618 8.32636C0.767618 8.56951 0.833969 8.62616 1.0577 8.62501C3.47876 8.617 5.89982 8.62043 8.32088 8.61872C8.4141 8.62329 8.51007 8.65648 8.59013 8.58096Z" fill="#FF6B08"/>
                                </svg>
                                <p style={{color: '#898F9F', fontWeight: 400, margin: '11px 0 0', fontSize: '14px'}}>
                                    Визначте ціль, оберіть період, розпочинайте тренування.
                                </p>
                            </div>
                        </div>
                        <div style={{paddingBottom: '100%'}}></div>
                    </div>
                ) : (
                    <>
                        <div>
                            {finish.length === 0 ? (
                                <></>
                            ) : (
                                    <div>
                                        <p style={{margin: '44px 0 14px calc(50%  - 601px)', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 600}}>Прочитано</p>
                                        <div style={{display: 'flex', color: '#898F9F', fontFamily: '"Montserrat", serif', fontWeight: 500}}>
                                            <p style={{margin: '14px 255px 14px calc(50%  - 601px)'}}>Назва книги</p>
                                            <p style={{margin: '14px 167px 14px 0'}}>Автор</p>
                                            <p style={{margin: '14px 99px 14px 0'}}>Рік</p>
                                            <p style={{margin: '14px 90px 14px 0'}}>Стор.</p>
                                            <p style={{margin: '14px 0'}}>Рейтинг книги</p>
                                        </div>
                                    </div>

                                )
                            }
                            {finish.length === 0 ? (
                                <></>
                            ) : (
                                finish.map(book => (
                                    <div key={book.id} style={{backgroundColor: '#fff', display: 'flex', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500, boxShadow: '0 2px 2px #091E3F1A', margin: '0 39px 10px calc(50%  - 601px)', width: '1202px'}}>
                                        <svg style={{margin: '20px 18px 20px 20px'}} width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 0.5C18.89 0.15 17.67 0 16.5 0C14.55 0 12.45 0.4 11 1.5C9.55 0.4 7.45 0 5.5 0C3.55 0 1.45 0.4 0 1.5V16.15C0 16.4 0.25 16.65 0.5 16.65C0.6 16.65 0.65 16.6 0.75 16.6C2.1 15.95 4.05 15.5 5.5 15.5C7.45 15.5 9.55 15.9 11 17C12.35 16.15 14.8 15.5 16.5 15.5C18.15 15.5 19.85 15.8 21.25 16.55C21.35 16.6 21.4 16.6 21.5 16.6C21.75 16.6 22 16.35 22 16.1V1.5C21.4 1.05 20.75 0.75 20 0.5ZM20 14C18.9 13.65 17.7 13.5 16.5 13.5C14.8 13.5 12.35 14.15 11 15V3.5C12.35 2.65 14.8 2 16.5 2C17.7 2 18.9 2.15 20 2.5V14Z" fill="#6D7A8D"/>
                                            <path d="M16.5 6C17.38 6 18.23 6.09 19 6.26V4.74C18.21 4.59 17.36 4.5 16.5 4.5C14.8 4.5 13.26 4.79 12 5.33V6.99C13.13 6.35 14.7 6 16.5 6Z" fill="#6D7A8D"/>
                                            <path d="M12 7.98991V9.64991C13.13 9.00991 14.7 8.65991 16.5 8.65991C17.38 8.65991 18.23 8.74991 19 8.91991V7.39991C18.21 7.24991 17.36 7.15991 16.5 7.15991C14.8 7.15991 13.26 7.45991 12 7.98991Z" fill="#6D7A8D"/>
                                            <path d="M16.5 9.83008C14.8 9.83008 13.26 10.1201 12 10.6601V12.3201C13.13 11.6801 14.7 11.3301 16.5 11.3301C17.38 11.3301 18.23 11.4201 19 11.5901V10.0701C18.21 9.91008 17.36 9.83008 16.5 9.83008Z" fill="#6D7A8D"/>
                                        </svg>
                                        <p style={{margin: '22px 18px 22px 0', width: '283px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.title}</p>
                                        <p style={{margin: '22px 18px 22px 0', width: '199px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.author}</p>
                                        <p style={{margin: '22px 65px 22px 0', width: '60px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.year}</p>
                                        <p style={{margin: '22px 23px 22px 0', width: '110px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.pages}</p>
                                        <div style={{margin: '22px 0', width: '101px'}}><Stars value={book.rating || book.mark} /></div>
                                        <button onClick={() => { setSelectedBook(book); setIsModalOpen(true); }} style={{margin: '11px 50px', color: '#fff', backgroundColor: '#6D7A8D', padding: '12px 36px', border: '0', width: '130px' }}>Резюме</button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div>
                            {reading.length === 0 ? 
                                (
                                    <></>
                                ) : (
                                    <div>
                                        <div>
                                            <p style={{margin: '44px 0 14px calc(50%  - 601px)', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 600}}>Читаю</p>
                                            <div style={{display: 'flex', color: '#898F9F',  fontFamily: '"Montserrat", serif', fontWeight: 500}}>
                                                <p style={{margin: '14px 520px 14px calc(50%  - 601px)'}}>Назва книги</p>
                                                <p style={{margin: '14px 298px 14px 0'}}>Автор</p>
                                                <p style={{margin: '14px 90px 14px 0'}}>Рік</p>
                                                <p style={{margin: '14px 0'}}>Стор.</p>
                                            </div>
                                        </div>   
                                        {reading.map(book => (
                                            <div key={book.id} style={{backgroundColor: '#fff', display: 'flex', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500, boxShadow: '0 2px 2px #091E3F1A', margin: '0 39px 10px calc(50%  - 601px)', width: '1202px'}}>
                                                <svg style={{margin: '20px 18px 20px 20px'}} width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20 0.5C18.89 0.15 17.67 0 16.5 0C14.55 0 12.45 0.4 11 1.5C9.55 0.4 7.45 0 5.5 0C3.55 0 1.45 0.4 0 1.5V16.15C0 16.4 0.25 16.65 0.5 16.65C0.6 16.65 0.65 16.6 0.75 16.6C2.1 15.95 4.05 15.5 5.5 15.5C7.45 15.5 9.55 15.9 11 17C12.35 16.15 14.8 15.5 16.5 15.5C18.15 15.5 19.85 15.8 21.25 16.55C21.35 16.6 21.4 16.6 21.5 16.6C21.75 16.6 22 16.35 22 16.1V1.5C21.4 1.05 20.75 0.75 20 0.5ZM20 14C18.9 13.65 17.7 13.5 16.5 13.5C14.8 13.5 12.35 14.15 11 15V3.5C12.35 2.65 14.8 2 16.5 2C17.7 2 18.9 2.15 20 2.5V14Z" fill="#FF6B08"/>
                                                    <path d="M16.5 6C17.38 6 18.23 6.09 19 6.26V4.74C18.21 4.59 17.36 4.5 16.5 4.5C14.8 4.5 13.26 4.79 12 5.33V6.99C13.13 6.35 14.7 6 16.5 6Z" fill="#FF6B08"/>
                                                    <path d="M12 7.98991V9.64991C13.13 9.00991 14.7 8.65991 16.5 8.65991C17.38 8.65991 18.23 8.74991 19 8.91991V7.39991C18.21 7.24991 17.36 7.15991 16.5 7.15991C14.8 7.15991 13.26 7.45991 12 7.98991Z" fill="#FF6B08"/>
                                                    <path d="M16.5 9.83008C14.8 9.83008 13.26 10.1201 12 10.6601V12.3201C13.13 11.6801 14.7 11.3301 16.5 11.3301C17.38 11.3301 18.23 11.4201 19 11.5901V10.0701C18.21 9.91008 17.36 9.83008 16.5 9.83008Z" fill="#FF6B08"/>
                                                </svg>
                                                <p style={{margin: '22px 18px 22px 0', width: '548px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.title}</p>
                                                <p style={{margin: '22px 18px 22px 0', width: '330px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.author}</p>
                                                <p style={{margin: '22px 57px 22px 0', width: '60px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.year}</p>
                                                <p style={{margin: '22px 15px 22px 0', width: '96px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.pages}</p>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        </div>
                        <div style={{paddingBottom: '100%'}}>
                            {wantread.length === 0 ? (
                                <></>
                            ) : (
                                    <div>
                                        <p style={{margin: '44px 0 14px calc(50%  - 601px)', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 600}}>Маю намір прочитати</p>
                                        <div style={{display: 'flex', color: '#898F9F',  fontFamily: '"Montserrat", serif', fontWeight: 500}}>
                                            <p style={{margin: '14px 520px 14px calc(50%  - 601px)'}}>Назва книги</p>
                                            <p style={{margin: '14px 298px 14px 0'}}>Автор</p>
                                            <p style={{margin: '14px 90px 14px 0'}}>Рік</p>
                                            <p style={{margin: '14px 0'}}>Стор.</p>
                                        </div>
                                    </div>
                                )
                            }
                            {wantread.length === 0 ? (
                                <></>
                            ) : (
                                wantread.map(book => (
                                    <div key={book.id} style={{backgroundColor: '#fff', display: 'flex', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500, boxShadow: '0 2px 2px #091E3F1A', margin: '0 0 10px calc(50% - 601px)', width: '1202px'}}>
                                        <svg style={{margin: '20px 18px 20px 20px'}} width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 0.5C18.89 0.15 17.67 0 16.5 0C14.55 0 12.45 0.4 11 1.5C9.55 0.4 7.45 0 5.5 0C3.55 0 1.45 0.4 0 1.5V16.15C0 16.4 0.25 16.65 0.5 16.65C0.6 16.65 0.65 16.6 0.75 16.6C2.1 15.95 4.05 15.5 5.5 15.5C7.45 15.5 9.55 15.9 11 17C12.35 16.15 14.8 15.5 16.5 15.5C18.15 15.5 19.85 15.8 21.25 16.55C21.35 16.6 21.4 16.6 21.5 16.6C21.75 16.6 22 16.35 22 16.1V1.5C21.4 1.05 20.75 0.75 20 0.5ZM20 14C18.9 13.65 17.7 13.5 16.5 13.5C14.8 13.5 12.35 14.15 11 15V3.5C12.35 2.65 14.8 2 16.5 2C17.7 2 18.9 2.15 20 2.5V14Z" fill="#A6ABB9"/>
                                            <path d="M16.5 6C17.38 6 18.23 6.09 19 6.26V4.74C18.21 4.59 17.36 4.5 16.5 4.5C14.8 4.5 13.26 4.79 12 5.33V6.99C13.13 6.35 14.7 6 16.5 6Z" fill="#A6ABB9"/>
                                            <path d="M12 7.99003V9.65003C13.13 9.01003 14.7 8.66003 16.5 8.66003C17.38 8.66003 18.23 8.75003 19 8.92003V7.40003C18.21 7.25003 17.36 7.16003 16.5 7.16003C14.8 7.16003 13.26 7.46003 12 7.99003Z" fill="#A6ABB9"/>
                                            <path d="M16.5 9.82996C14.8 9.82996 13.26 10.12 12 10.66V12.32C13.13 11.68 14.7 11.33 16.5 11.33C17.38 11.33 18.23 11.42 19 11.59V10.07C18.21 9.90996 17.36 9.82996 16.5 9.82996Z" fill="#A6ABB9"/>
                                        </svg> 
                                        <p style={{margin: '22px 18px 22px 0', width: '548px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.title}</p>
                                        <p style={{margin: '22px 18px 22px 0', width: '330px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.author}</p>
                                        <p style={{margin: '22px 57px 22px 0', width: '60px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.year}</p>
                                        <p style={{margin: '22px 15px 22px 0', width: '96px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.pages}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

export default Library;