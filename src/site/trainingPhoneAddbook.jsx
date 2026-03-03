import { useContext, useState, useRef, useEffect, useMemo } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE;
import { PageState } from './pagestate';
import { Link } from 'react-router-dom';

function TrainingPhoneAddbook() {
    const [focused3, setFocused3] = useState(false);
    const { currentUser, setCurrentUser } = useContext(PageState);
    const { books} = useContext(PageState);
    const [train, setTrain] = useState({bookname: ''});
    const name = (currentUser && typeof currentUser.name === 'string') ? currentUser.name : '';
    const firstLetter = name.trim().charAt(0).toUpperCase();
    let uid = currentUser?.id || currentUser?.userid; 
    if (!uid) {
        try {
            const raw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            const saved = raw ? JSON.parse(raw) : null;
            uid = uid || saved?.id || saved?.userid || saved?.user_id || null;
        } catch (e) {
            uid = uid || null;
        }
    }
    const [selectBook, setSelectBook] = useState(() => {
        try {
            const saved = sessionStorage.getItem('selectBook');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    useEffect(() => {
        sessionStorage.setItem('selectBook', JSON.stringify(selectBook));
    }, [selectBook]);
    const [needbooks, setNeedbooks] = useState([]);
    const { pages } = useContext(PageState);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserPages, setCurrentUserPages] = useState([]);
    const { needfinish, wantread, reading, finishing, currentUserPages: userPages } = useMemo(() => {
        const wantread = [];
        const reading = [];
        const finishing = [];
        const currentUserPages = [];  
        const needfinish = [];
        pages.forEach(page => {
            const pid = page.user_id;
            pid == uid ? currentUserPages.push(page) : null;
        });
        books.forEach(book => {
            const bid = book.user_id;
            String(bid) === String(uid) 
                ? (book.finished)
                    ? book.read_status == 1
                        ? (needfinish.push(book), finishing.push(book))
                        : finishing.push(book)
                    : book.read_status == 1
                        ? reading.push(book)
                        : wantread.push(book)
                : null
        });
        return { needfinish, wantread, reading, finishing, currentUserPages };
    }, [books, pages, uid])
    books.forEach(book => {
        const bid = book.user_id;
        String(bid) === String(uid) 
            ? (book.finished)
                ? book.read_status == 1
                    ? (needfinish.push(book), finishing.push(book))
                    : finishing.push(book)
                : book.read_status == 1
                    ? reading.push(book)
                    : wantread.push(book)
            : null
    });
    const onChange = async (value, name) => {
        if (name === 'bookname') {
            setTrain(prev => ({ ...prev, bookname: value }));
            if (!value.trim() || !uid) {
                setNeedbooks([]);
                return;
            }
            try {
                const url = `${API_BASE}/getBooks.php?user_id=${uid}&query=${encodeURIComponent(value)}`;
                console.debug('getBooks fetch URL:', url);
                const response = await fetch(url, {
                    headers: {
                        "ngrok-skip-browser-warning": "true"
                    }
                });
                if (!response.ok) {
                    const txt = await response.text().catch(() => '');
                    console.debug('getBooks non-OK response:', response.status, 'content-type:', response.headers.get('content-type'), txt);
                    setNeedbooks([]);
                    return;
                }
                const ct = (response.headers.get('content-type') || '').toLowerCase();
                let data = null;
                console.debug('getBooks response status:', response.status, 'content-type:', ct);
                if (ct.includes('application/json')) {
                    try {
                        data = await response.json();
                    } catch (e) {
                        const txt = await response.text().catch(() => '');
                        console.debug('Failed to parse JSON from getBooks:', txt, 'headers:', Object.fromEntries(response.headers));
                        setNeedbooks([]);
                        return;
                    }
                } else {
                    const txt = await response.text().catch(() => '');
                    console.debug('getBooks returned non-json:', txt);
                    const ngrokErr = response.headers.get('x-ngrok-error') || response.headers.get('x-ngrok-status');
                    if (ngrokErr) console.debug('ngrok header:', ngrokErr);
                    if (API_BASE.includes('ngrok')) {
                        const LOCAL_BASE = 'http://localhost/api';
                        const altUrl = `${LOCAL_BASE}/getBooks.php?user_id=${uid}&query=${encodeURIComponent(value)}`;
                        console.debug('Retrying getBooks with local base:', altUrl);
                        try { 
                            const altResp = await fetch(altUrl, {
                                headers: {
                                    "ngrok-skip-browser-warning": "true"
                                }
                            });
                            if (altResp.ok) {
                                const altCt = (altResp.headers.get('content-type') || '').toLowerCase();
                                if (altCt.includes('application/json')) {
                                    data = await altResp.json();
                                    console.debug('getBooks fallback succeeded');
                                } else {
                                    const altTxt = await altResp.text().catch(() => '');
                                    console.debug('fallback also non-json:', altTxt);
                                }
                            } else {
                                console.debug('fallback response not ok', altResp.status);
                            }
                        } catch (e) {
                            console.debug('fallback fetch error', e);
                        }
                    }
                    if (!data) {
                        setNeedbooks([]);
                        return;
                    }
                }
                const raw = Array.isArray(data) ? data : (Array.isArray(data?.books) ? data.books : []);
                if ((!raw || raw.length === 0) && data && typeof data === 'object') console.debug('getBooks returned non-array:', data);
                const normalized = raw.map(b => {
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
                setNeedbooks(normalized);
            } catch (error) {
                console.error("Помилка при пошуку книг:", error);
            }
        }
    };
    useEffect(() => {
        setCurrentUserPages(userPages);
    }, [userPages]);
    const inputData = () => {
        if (needbooks.length > 0) {
            const firstBook = needbooks[0];
            !selectBook.some(b => b.id === firstBook.id) ? setSelectBook(prev => [...prev, firstBook]) : null;
            setTrain({ bookname: '' });
            setNeedbooks([]);
            alert('Книгу додано')
        }
    };
    function Modal({onClose}) {
        return (
            <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center'}} >
                <div onClick={e => e.stopPropagation()} style={{background:'#fff', width: isPhone ? '270px' : '390px', height: isPhone ? '223px' : '186px'}}>
                    <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, margin: isPhone ? '47px 16px 20px 17px' : '47px 51px 25px', textAlign: 'center'}}>Якщо Ви вийдете з програми<br />незбережені дані будуть втрачені</p>
                    <button onClick={onClose} style={{backgroundColor: "#fff", border: '1px solid #242A37', width: isPhone ? '98px' : '130px', height: '40px', margin: isPhone ? '0 15px 0 30px' : '0 30px 0 50px', cursor: 'pointer'}}>Вiдмiна</button>
                    <Link to="/login">
                        <button onClick={()=>{localStorage.removeItem("currentUser"), setCurrentUser(null)}} style={{color: '#fff', backgroundColor: '#FF6B08', border: '0', fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: '14px', padding: isPhone ? '11px 25px' : '11px 42px', cursor: 'pointer'}}>Вийти</button>
                    </Link>
                </div>
            </div>
        );
    }
    return (
        <>
            {isModalOpen && (
                <Modal
                    onClose={() => { setIsModalOpen(false) }}
                />
            )}
            <header style={{padding: '12px 15px', gridTemplateColumns: '1fr auto 1fr', boxShadow: '0 2px 2px #091E3F1A', backgroundColor: '#FFF', display: 'grid', alignItems: 'center', position: 'fixed', width: 'calc(100vw - 30px)', zIndex: 100}}>
                <Link to="/library" style={{textDecoration: 'none', color: '#000'}}><p style={{fontFamily: '"Abril Fatface", serif', fontWeight: 400, margin: '0', justifyContent: 'start'}}>BR</p></Link>
                <div style={{justifyContent: 'center', display: 'flex', alignItems: 'center'}}></div>
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
                    <p onClick={()=>{setIsModalOpen(true)}} style={{fontFamily: '"Montserrat", serif', fontWeight: 300, color: '#242A37', margin: '7px 13px 0 14px', textDecoration: 'underline'}}>Вихiд</p>
                </div>
            </header>
            <main style={{backgroundColor: '#F6F7FB', minHeight: '100vh', height: '100%', paddingTop: '60px'}}>
                <Link to='/training' style={{cursor: 'pointer', margin: '0 auto 0 25px'}}>
                    <svg width="24" height="12" style={{marginTop: '25px'}} viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.274948 6.47611C0.275228 6.47639 0.275463 6.47672 0.275791 6.477L5.17442 11.352C5.54141 11.7172 6.13498 11.7158 6.50028 11.3488C6.86553 10.9818 6.86412 10.3883 6.49714 10.023L3.2082 6.75L23.0625 6.75C23.5803 6.75 24 6.33028 24 5.8125C24 5.29472 23.5803 4.875 23.0625 4.875L3.20825 4.875L6.49709 1.602C6.86408 1.23675 6.86548 0.643171 6.50023 0.276187C6.13494 -0.0908922 5.54131 -0.0921577 5.17437 0.273L0.275745 5.148C0.275463 5.14828 0.275228 5.14861 0.2749 5.14889C-0.0922723 5.51536 -0.0910993 6.11086 0.274948 6.47611Z" fill="#FF6B08"/>
                    </svg>
                </Link>
                <div style={{fontFamily: '"Montserrat", serif', fontWeight: 600, fontSize: '20px', margin: '25px 0'}}>
                    <input value={train.bookname} onFocus={() => setFocused3(true)} onBlur={() => setFocused3(false)} placeholder='Обрати книги з бібліотеки' onChange={e => onChange(e.target.value, 'bookname')} style={{marginLeft: '25px', outline: 'none', fontWeight: 400, color: '#A6ABB9', backgroundColor: focused3 ? '#fff' : '#F6F7FB', border: focused3 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', width:  focused3 ? 'calc(100vw - 61px)' : 'calc(100vw - 63px)', height:  focused3 ? '44px' : '42px', boxShadow: focused3 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}} />
                <div style={{backgroundColor: '#fff', width: 'calc(100vw - 50px)', borderRadius: '0 0 6px 6px', position: 'absolute', marginLeft: '26px'}}>
                    {needbooks.length === 0 || train.bookname == '' || !focused3  ? (
                            <></>
                        ) : (
                                needbooks.map(book => (
                                    <p key={book.id} onMouseDown={() => {
                                        const real = books.find(b => String(b.id) === String(book.id)) || book;
                                        !selectBook.some(b => String(b.id) === String(real.id)) ? setSelectBook(prev => [...prev, real]) : null;
                                        setTrain({ bookname: book.title });
                                        setNeedbooks([]);
                                    }} style={{cursor: 'pointer', margin: '0', padding: '0 10px'}}>{book.title}</p>
                                )
                            )
                        )
                    }
                </div>
                    <button onClick={inputData} style={{margin: '35px 0 0 calc(50vw - 85.5px)', backgroundColor: "#F6F7FB", border: '1px solid #242A37', width: '171px', height: '42px', cursor: 'pointer'}}>Додати</button>
                </div>
            </main>
        </>
    )
}

export default TrainingPhoneAddbook;