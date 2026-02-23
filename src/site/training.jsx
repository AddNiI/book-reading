import  { React, useContext, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageState } from './pagestate.jsx';
import { Line } from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend} from 'chart.js';

function Training() {
    ChartJS.register(CategoryScale, LinearScale,  PointElement, LineElement, Title, Tooltip, Legend);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currentUser, setCurrentUser, setUsers } = useContext(PageState);
    const name = currentUser?.name || '';
    const firstLetter = name.trim().charAt(0).toUpperCase();
    const uid = currentUser?.userid;
    const { books, setBooks} = useContext(PageState);
    const [train, setTrain] = useState({bookname: ''});
    const [selectBook, setSelectBook] = useState([]);
    const [needbooks, setNeedbooks] = useState([]);
    const [date1, setDate1] = useState('');
    const [date2, setDate2] = useState('');
    const [data3, setData3] = useState('');
    const [data4, setData4] = useState('');
    const [countPages, setCountPages] = useState('');
    const { pages, setPages} = useContext(PageState);
    const [ currentUserPages, setCurrentUserPages ] = useState([])
    const [focused1, setFocused1] = useState(false);
    const [focused2, setFocused2] = useState(false);
    const [focused3, setFocused3] = useState(false);
    const [focused4, setFocused4] = useState(false);
    const [focused5, setFocused5] = useState(false);
    const training = currentUser?.training
    const [yearCountdown, setYearCountdown] = useState({days: 0, hours: 0, minutes: 0, seconds: 0});
    const [goalCountdown, setGoalCountdown] = useState({days: 0, hours: 0, minutes: 0, seconds: 0});
    const { wantread, reading, finishing, currentUserPages: userPages } = useMemo(() => {
        const wantread = [];
        const reading = [];
        const finishing = [];
        const currentUserPages = [];
        
        pages.forEach(page => {
            const pid = page.whatuserid;
            pid == uid ? currentUserPages.push(page) : null;
        });
        
        books.forEach(book => {
            const bid = book.whatuserid;
            bid == uid
                ? (book.finished) 
                    ? finishing.push(book)
                    : (book.read) 
                        ? reading.push(book)
                        : wantread.push(book)
                : null;
        });
        
        return { wantread, reading, finishing, currentUserPages };
    }, [books, pages, uid]);
    const onChange = (value, name) => {
        return name === 'bookname'
            ? (() => {
                setTrain(prev => ({ ...prev, bookname: value }));
                const q = String(value || '').trim().toLowerCase();
                return !q
                    ? (setNeedbooks([]), undefined)
                    : (setNeedbooks(books.filter(b => String(b.whatuserid) == String(uid) && String(b.bookname || '').toLowerCase().includes(q))), undefined);
            })()
            : null;
    };
    useEffect(() => {
        const now = new Date().toISOString().split('T')[0];
        const finishDate = currentUser?.finishDate;
        
        if (training && finishDate === now) {
            setCurrentUser(prev => ({ ...prev, training: false }));
            setUsers(prev => prev.map(user => 
            user.userid === uid ? { ...user, training: false } : user
            ));
        }
        
        training
            ? (currentUser?.readDays !== undefined && data3 !== currentUser.readDays)   
            ? setData3(currentUser.readDays)
            : null
            : (date1 !== '' && date2 !== '') 
            ? setData3(Math.ceil((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24)).toString())
            : setData3('0')
    }, [training, date1, date2, currentUser?.readDays]);
    const totalPages = useMemo(() => {
        return reading.reduce((sum, book) => sum + parseInt(book.pages || 0), 0) + 
               finishing.reduce((sum, book) => sum + parseInt(book.pages || 0), 0);
    }, [reading, finishing]);
    const dailyNorm = useMemo(() => {
        return data3 ? Math.ceil(totalPages / parseInt(data3)) : 0;
    }, [totalPages, data3]);
    const chartData = useMemo(() => {
        const dates = currentUserPages.map(page => page.date);
        const pagesRead = currentUserPages.map(page => parseInt(page.pages || 0));
        const normLine = dates.map(() => dailyNorm);
        
        return {
            labels: dates,
            datasets: [
                {
                    label: 'Прочитано сторінок',
                    data: pagesRead,
                    borderColor: '#FF6B08',
                    backgroundColor: 'rgba(255, 107, 8, 0.1)',
                    tension: 0.4,
                },
                {
                    label: 'План',
                    data: normLine,
                    borderColor: '#000',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0,
                },
            ],
        };
    }, [currentUserPages, dailyNorm]);
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };
    useEffect(() => {
        setCurrentUserPages(userPages);
    }, [userPages]);
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            const finishDate = new Date(currentUser?.finishDate);
            
            const yearDiff = Math.floor((endOfYear - now) / 1000);
            const goalDiff = Math.floor((finishDate - now) / 1000);
            
            setYearCountdown({
                days: Math.floor(yearDiff / 86400),
                hours: Math.floor((yearDiff % 86400) / 3600),
                minutes: Math.floor((yearDiff % 3600) / 60),
                seconds: yearDiff % 60
            });
            
            setGoalCountdown({
                days: Math.floor(goalDiff / 86400),
                hours: Math.floor((goalDiff % 86400) / 3600),
                minutes: Math.floor((goalDiff % 3600) / 60),
                seconds: goalDiff % 60
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, [currentUser?.finishDate]);
    const inputData = () => {
        // prefer the filtered suggestion; if empty, try to find by typed name
        let real = null;
        needbooks.length > 0
            ? (() => { const candidate = needbooks[0]; real = books.find(b => String(b.id) === String(candidate.id)) || candidate; })()
            : ( (train.bookname || '').trim() !== ''
                ? (() => { const q = String(train.bookname).trim().toLowerCase(); real = books.find(b => String(b.whatuserid) === String(uid) && String(b.bookname || '').toLowerCase() === q) || books.find(b => String(b.whatuserid) === String(uid) && String(b.bookname || '').toLowerCase().includes(q)); })()
                : null);
        real ? (!selectBook.some(book => String(book.id) === String(real.id)) ? setSelectBook(prev => [...prev, real]) : null) : null;
        setTrain({bookname: ''});
        setNeedbooks([]);
    }
    const onChangeStartDate = (value, name) => {
        name === 'date1'
            ? setDate1(value)
            : setDate2(value);
    }
    const delBook = (id) => {
        setSelectBook(prev => prev.filter(book => book.id !== id));
    };
    const startTraining = () => {
        setCurrentUser(prev => ({...prev, training: true, finishDate: new Date(date2).toISOString().split('T')[0], readDays: data3}))
        setUsers(prev => prev.map(user => 
            user.userid === uid 
                ? {...user, training: true, finishDate: new Date(date2).toISOString().split('T')[0], readDays: data3}
                : user
            
        ))
        setBooks(prev => prev.map(book => 
            selectBook.some(sb => sb.id === book.id) 
                ? {...book, read: true}
                : book
        ))
    }
    const addDate = () => {
        const nowTime = new Date().toLocaleTimeString('ua-UA', {})
        return data4 !== '' && countPages !== ''
            ? (() => { const newPage = {date: data4, time: nowTime, pages: countPages, userid: uid, whatuserid: uid}; setPages(prev => [...prev, newPage]); setCurrentUserPages(prev => [...prev, newPage]); setData4(''); setCountPages(''); })()
            : null;
    }
    const onChangeDate4  = (value) => {
        setData4(value)
    }
    
    const finishBook = (id) => {
        setBooks(prev => prev.map(book => book.id === id ? {...book, finished: true} : book));
    }
    const unfinishBook = (id) => {
        setBooks(prev => prev.map(book => book.id === id ? {...book, finished: false} : book));
    }
    const onChangePages = (value) => {
        setCountPages(value)
    }
    function Modal({onClose}) {
        return (
            <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center'}} >
                <div onClick={e => e.stopPropagation()} style={{background:'#fff', width: '390px', height: '206px', borderRadius: '6px '}}>
                    <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, margin: '47px 51px 25px', textAlign: 'center'}}>Якщо Ви вийдете з програми<br />незбережені дані будуть втрачені</p>
                    <button onClick={onClose} style={{backgroundColor: "#fff", border: '1px solid #242A37', width: '130px', height: '40px', margin: '0 30px 0 50px', cursor: 'pointer'}}>Вiдмiна</button>
                    <Link to="/book-reading/login">
                        <button style={{color: '#fff', backgroundColor: '#FF6B08', border: '0', fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: '14px', padding: '11px 42px', cursor: 'pointer'}}>Вийти</button>
                    </Link>
                </div>
            </div>
        );
    }
    const chart = []
    return(
        <div>
            <header style={{padding: '13.5px 15px', gridTemplateColumns: '1fr auto 1fr', boxShadow: '0 2px 2px #091E3F1A', display: 'grid', alignItems: 'center'}}>
                <p style={{fontFamily: '"Abril Fatface", serif', fontWeight: 400, margin: '0', justifyContent: 'start'}}>BR</p>
                <div style={{justifyContent: 'center', display: 'flex', alignItems: 'center'}}>
                    <div style={{width: 33,height: 33,borderRadius: '50%',background: '#F5F7FA', margin: '0 12px 0 0',display: 'inline-flex',alignItems: 'center',justifyContent: 'center'}}><p style={{margin:'0', fontFamily: '"Montserrat", serif', fontWeight: 600, color: '#242A37'}}>{firstLetter}</p></div>
                        <p style={{fontFamily: '"Montserrat", serif', fontWeight: 300, color: '#242A37', margin: '0'}}>{name}</p>
                    </div>
                <div style={{justifyContent: 'end', display: 'flex'}}>
                    <Link to="/book-reading/training">
                        <div style={{width: 33,height: 33, borderRadius: '50%',background: '#F5F7FA', margin: '0 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0.5C18.89 0.15 17.67 0 16.5 0C14.55 0 12.45 0.4 11 1.5C9.55 0.4 7.45 0 5.5 0C3.55 0 1.45 0.4 0 1.5V16.15C0 16.4 0.25 16.65 0.5 16.65C0.6 16.65 0.65 16.6 0.75 16.6C2.1 15.95 4.05 15.5 5.5 15.5C7.45 15.5 9.55 15.9 11 17C12.35 16.15 14.8 15.5 16.5 15.5C18.15 15.5 19.85 15.8 21.25 16.55C21.35 16.6 21.4 16.6 21.5 16.6C21.75 16.6 22 16.35 22 16.1V1.5C21.4 1.05 20.75 0.75 20 0.5ZM20 14C18.9 13.65 17.7 13.5 16.5 13.5C14.8 13.5 12.35 14.15 11 15V3.5C12.35 2.65 14.8 2 16.5 2C17.7 2 18.9 2.15 20 2.5V14Z" fill="#A6ABB9"/>
                                <path d="M16.5 6C17.38 6 18.23 6.09 19 6.26V4.74C18.21 4.59 17.36 4.5 16.5 4.5C14.8 4.5 13.26 4.79 12 5.33V6.99C13.13 6.35 14.7 6 16.5 6Z" fill="#A6ABB9"/>
                                <path d="M12 7.99016V9.65016C13.13 9.01016 14.7 8.66016 16.5 8.66016C17.38 8.66016 18.23 8.75016 19 8.92016V7.40016C18.21 7.25016 17.36 7.16016 16.5 7.16016C14.8 7.16016 13.26 7.46016 12 7.99016Z" fill="#A6ABB9"/>
                                <path d="M16.5 9.83008C14.8 9.83008 13.26 10.1201 12 10.6601V12.3201C13.13 11.6801 14.7 11.3301 16.5 11.3301C17.38 11.3301 18.23 11.4201 19 11.5901V10.0701C18.21 9.91008 17.36 9.83008 16.5 9.83008Z" fill="#A6ABB9"/>
                            </svg>
                        </div>
                    </Link>
                    <Link to="/book-reading/library">
                        <svg style={{margin: '8px 11px 8px 14px'}} width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 2.69L15 7.19V15H13V9H7V15H5V7.19L10 2.69ZM10 0L0 9H3V17H9V11H11V17H17V9H20L10 0Z" fill="#A6ABB9"/>
                        </svg>
                    </Link>
                    <svg width="1" height="33" viewBox="0 0 1 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0.5" y1="-2.18557e-08" x2="0.500001" y2="33" stroke="#E0E5EB"/>
                    </svg>
                    <p onClick={() => { setIsModalOpen(true); }} style={{cursor: 'pointer', fontFamily: '"Montserrat", serif', fontWeight: 300, color: '#242A37', margin: '7px 0 0 14px', textDecoration: 'underline'}}>Вихiд</p>
                </div>
            </header>
            <main style={{backgroundColor: '#F6F7FB', display: 'flex', padding:'0 0 0 calc(50% - 601px)'}}>
                {isModalOpen && (
                    <Modal
                        onClose={() => { setIsModalOpen(false) }}
                    />
                )}
                <div>
                    {training ? (
                    <div style={{display: 'flex', marginLeft: 'calc(50% - 324px)'}}>
                        <div style={{marginRight: '68px', fontFamily: '"Montserrat", serif'}}>
                            <p style={{fontWeight: 500, fontSize: '14px', margin: '24px 0 8px 25px', color: '#898F9F'}}>До закінчення року залишилось</p>
                            <div style={{display: 'flex', backgroundColor: '#fff', width: '290px', boxShadow: '4px 4px 4px #242A3726'}}>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0 10px 20px', width: '63px', textAlign: 'center'}}>{String(yearCountdown.days).padStart(2, '0')}</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '8px', textAlign: 'center'}}>:</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '49px', textAlign: 'center'}}>{String(yearCountdown.hours).padStart(2, '0')}</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '8px', textAlign: 'center'}}>:</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '49px', textAlign: 'center'}}>{String(yearCountdown.minutes).padStart(2, '0')}</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '8px', textAlign: 'center'}}>:</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '49px', textAlign: 'center'}}>{String(yearCountdown.seconds).padStart(2, '0')}</p>
                            </div>
                        </div>
                        <div style={{fontFamily: '"Montserrat", serif'}}>
                            <p style={{fontWeight: 500, fontSize: '14px', margin: '24px 0 8px 22px', color: '#898F9F'}}>До досягнення мети залишилось</p>
                            <div style={{display: 'flex', backgroundColor: '#fff', width: '290px', boxShadow: '4px 4px 4px #242A3726'}}>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0 10px 20px', width: '63px', textAlign: 'center'}}>{String(goalCountdown.days).padStart(2, '0')}</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '8px', textAlign: 'center'}}>:</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '49px', textAlign: 'center'}}>{String(goalCountdown.hours).padStart(2, '0')}</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '8px', textAlign: 'center'}}>:</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '49px', textAlign: 'center'}}>{String(goalCountdown.minutes).padStart(2, '0')}</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '8px', textAlign: 'center'}}>:</p>
                                <p style={{fontWeight: 700, fontSize: '24px', margin: '10px 0', width: '49px', textAlign: 'center'}}>{String(goalCountdown.seconds).padStart(2, '0')}</p>
                            </div>
                        </div>
                    </div>
                    ) : (
                        <div>
                            <p style={{fontFamily: '"Montserrat", serif', fontWeight: 600, fontSize: '20px', backgroundColor: '#B1B5C2', margin: '50px 0 25px', padding: '18px 355px', color: '#FFF'}}>Моє тренування</p>
                            <div>
                                <div style={{fontFamily: '"Montserrat", serif', display: 'flex'}}>
                                    <div style={{display: 'flex'}}>
                                        <p style={{margin: '14px 5px 0 170px', fontWeight: 400, color: '#A6ABB9', width: '10px'}}>З</p>
                                        <input onFocus={() => setFocused1(true)} onBlur={() => setFocused1(false)}  type='date' value={date1} onChange={e => onChangeStartDate(e.target.value, 'date1')} style={{cursor: 'pointer', outline: 'none', fontWeight: 400, color: '#A6ABB9', backgroundColor: focused1 ? '#fff' : '#F6F7FB', border: focused1 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', margin: '0 45px 0 0', width:'222px', height: '42px', boxShadow: focused1 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}} />
                                    </div>
                                    <div style={{display: 'flex'}}>
                                        <p style={{margin: '14px 5px 0 0', fontWeight: 400, color: '#A6ABB9', width: '23px'}}>До</p>
                                        <input onFocus={() => setFocused2(true)} onBlur={() => setFocused2(false)}  type='date' value={date2} onChange={e => onChangeStartDate(e.target.value, 'date2')} style={{cursor: 'pointer', outline: 'none', fontWeight: 400, color: '#A6ABB9', backgroundColor: focused2 ? '#fff' : '#F6F7FB', border: focused2 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', width:'209px', height: '42px', boxShadow: focused2 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}} />
                                    </div>
                                </div>
                                <div>
                                    <input onFocus={() => setFocused3(true)} onBlur={() => setFocused3(false)} placeholder='Обрати книги з бібліотеки' onChange={e => onChange(e.target.value, 'bookname')} style={{outline: 'none', fontWeight: 400, color: '#A6ABB9', backgroundColor: focused3 ? '#fff' : '#F6F7FB', border: focused3 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', margin: '25px 46px 0 0', width:  focused3 ? '658px' : '656px', height:  focused3 ? '44px' : '42px', boxShadow: focused3 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}}></input>
                                    <button onClick={inputData} style={{backgroundColor: "#F6F7FB", border: '1px solid #242A37', width: '171px', height: '42px', cursor: 'pointer'}}>Додати</button>
                                </div>
                                    <div style={{backgroundColor: '#fff', width: '669px', borderRadius: '0 0 6px 6px', position: 'absolute', marginLeft: '1px'}}>
                                    {needbooks.length === 0 || train.bookname == '' || !focused3  ? (
                                            <></>
                                        ) : (
                                                needbooks.map(book => (
                                                    <p key={book.id} onClick={() => {
                                                        const real = books.find(b => String(b.id) === String(book.id)) || book;
                                                        !selectBook.some(b => String(b.id) === String(real.id)) ? setSelectBook(prev => [...prev, real]) : null;
                                                        setTrain({ bookname: '' });
                                                        setNeedbooks([]);
                                                    }} style={{cursor: 'pointer', margin: '0', padding: '0 10px'}}>{book.bookname}</p>
                                                )
                                            )
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                    <div>
                        <hr style={{color: '#898F9F', margin: '25px 0 0'}} />
                        <div style={{display: 'flex', color: '#898F9F'}}>
                            <p style={{margin: '10px 269px 10px calc(50% - 445px)'}}>Назва книги</p>
                            <p style={{margin: '10px 185px 10px 0'}}>Автор</p>
                            <p style={{margin: '10px 73px 10px 0'}}>Рiк</p>
                            <p style={{margin: '10px 0 10px'}}>Стор.</p>
                        </div>
                        <hr style={{color: '#898F9F', margin: '0'}} />
                        {training ? (
                            <>
                                {finishing.map(book => (
                                    <div key={book.id} style={{display: 'flex', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500, width: '886px'}}>
                                    <input type='checkbox' onChange={() => unfinishBook(book.id)} checked='true' style={{cursor: 'pointer', width: '15px', height: '15px', border: '1px solid #FF6B08', borderRadius: '0', accentColor: '#FF6B08', margin: '24px 24px 0 0'}}  />
                                        <p style={{margin: '21px 10px 0 0', width: '309px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.bookname}</p>
                                        <p style={{margin: '21px 10px 0 0', width: '219px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.author}</p>
                                        <p style={{margin: '21px 10px 0 0', width: '84px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.year}</p>
                                        <p style={{margin: '21px 10px 0 0', width: '138px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.pages}</p>
                                    </div>
                                ))}
                                {reading.map(book => (
                                    <div key={book.id} style={{display: 'flex', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500, width: '886px'}}>
                                        <input type='checkbox' onChange={() => finishBook(book.id)} style={{cursor: 'pointer', appearance: 'none', width: '15px', height: '15px', border: '1px solid #A6ABB9', borderRadius: '0', margin: '24px 24px 0 0'}} />
                                        <p style={{margin: '21px 10px 0 0', width: '309px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.bookname}</p>
                                        <p style={{margin: '21px 10px 0 0', width: '219px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.author}</p>
                                        <p style={{margin: '21px 10px 0 0', width: '84px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.year}</p>
                                        <p style={{margin: '21px 10px 0 0', width: '138px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.pages}</p>
                                    </div>
                                ))}
                            </>
                        ) : selectBook.length === 0 ? (
                            <></>
                        ) : (
                            selectBook.map(book => (
                                <div key={book.id} style={{display: 'flex', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500, width: '856px'}}>
                                    <svg style={{margin: '21px 17px 0 0'}} width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 0.5C18.89 0.15 17.67 0 16.5 0C14.55 0 12.45 0.4 11 1.5C9.55 0.4 7.45 0 5.5 0C3.55 0 1.45 0.4 0 1.5V16.15C0 16.4 0.25 16.65 0.5 16.65C0.6 16.65 0.65 16.6 0.75 16.6C2.1 15.95 4.05 15.5 5.5 15.5C7.45 15.5 9.55 15.9 11 17C12.35 16.15 14.8 15.5 16.5 15.5C18.15 15.5 19.85 15.8 21.25 16.55C21.35 16.6 21.4 16.6 21.5 16.6C21.75 16.6 22 16.35 22 16.1V1.5C21.4 1.05 20.75 0.75 20 0.5ZM20 14C18.9 13.65 17.7 13.5 16.5 13.5C14.8 13.5 12.35 14.15 11 15V3.5C12.35 2.65 14.8 2 16.5 2C17.7 2 18.9 2.15 20 2.5V14Z" fill="#A6ABB9"/>
                                        <path d="M16.5 6C17.38 6 18.23 6.09 19 6.26V4.74C18.21 4.59 17.36 4.5 16.5 4.5C14.8 4.5 13.26 4.79 12 5.33V6.99C13.13 6.35 14.7 6 16.5 6Z" fill="#A6ABB9"/>
                                        <path d="M12 7.99003V9.65003C13.13 9.01003 14.7 8.66003 16.5 8.66003C17.38 8.66003 18.23 8.75003 19 8.92003V7.40003C18.21 7.25003 17.36 7.16003 16.5 7.16003C14.8 7.16003 13.26 7.46003 12 7.99003Z" fill="#A6ABB9"/>
                                        <path d="M16.5 9.82996C14.8 9.82996 13.26 10.12 12 10.66V12.32C13.13 11.68 14.7 11.33 16.5 11.33C17.38 11.33 18.23 11.42 19 11.59V10.07C18.21 9.90996 17.36 9.82996 16.5 9.82996Z" fill="#A6ABB9"/>
                                    </svg> 
                                    <p style={{margin: '21px 10px 0 0', width: '309px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.bookname}</p>
                                    <p style={{margin: '21px 10px 0 0', width: '219px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.author}</p>
                                    <p style={{margin: '21px 10px 0 0', width: '84px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.year}</p>
                                    <p style={{margin: '21px 10px 0 0', width: '138px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.pages}</p>
                                    <svg onClick={() => delBook(book.id)} style={{cursor: 'pointer', margin: '21px 25px 0 0'}} width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 6V16H3V6H11ZM9.5 0H4.5L3.5 1H0V3H14V1H10.5L9.5 0ZM13 4H1V16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4Z" fill="#A6ABB9"/>
                                    </svg>
                                </div>
                            ))
                        )}
                        <hr style={{color: '#898F9F', margin: '41px 0 0'}} />
                        {training ? (
                            <></>
                        ) : (
                            <button onClick={startTraining} style={{color: '#fff', cursor: 'pointer', backgroundColor: '#FF6B08', border: '0', fontFamily: '"Montserrat", serif', fontWeight: 600, fontSize: '16px', padding: '12px 30px', margin: '40px 0 40px calc(50% - 100px)'}}>Почати тренування</button>
                        )}
                        <div style={{width: '886px', height: '340px', backgroundColor: '#fff', margin: training ? '40px 0 calc(100% - 595px) calc(50% - 443px)': '0 0 calc(100% - 830px) calc(50% - 443px)', boxShadow: '2px 2px 2px #091E3F40'}}>
                            {training && currentUserPages.length > 0 && (
                                <Line data={chartData} options={chartOptions} />
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <p style={{fontFamily: '"Montserrat", serif', fontWeight: 600, fontSize: '20px', color: '#fff', backgroundColor: '#B1B5C2', margin: '50px 0 0 41px', padding: '18px 28px'}}>Моя мета прочитати</p>
                    <div style={{fontFamily: '"Montserrat", serif', fontWeight: 500, display: 'flex', backgroundColor: '#fff', margin: '0 0 40px 41px', boxShadow: '2px 2px 2px #091E3F1A'}}>
                        <div>
                            <p style={{fontFamily: '"Open Sans", serif', textAlign: 'center', fontWeight: 700, fontSize: '45px', color: '#091E3F', margin: '0', width: training ? '66px' : '100px', height: training ? '66px' : '100px', margin: training ? '72px 22px 0 17px' : '55px 20px 14px 28px', backgroundColor: '#F5F7FA', boxShadow: '4px 4px 4px #242A3726'}}>{training ? (reading.length + finishing.length) : selectBook.length}</p>
                            <p style={{fontSize:'12px',color: '#898F9F', margin: training ? "14px 0 76px 22px" : '14px 20px 55px 45px', width: '66px'}}>Кiлькiсть книжок</p>
                        </div>
                        <div>
                            <p style={{fontFamily: '"Open Sans", serif', textAlign: 'center', fontWeight: 700, fontSize: '45px', color: '#091E3F', margin: '0', width: training ? '66px' : '100px', height: training ? '66px' : '100px', margin: training ? '72px 22px 0 0' : '55px 0 14px 0', backgroundColor: '#F5F7FA', boxShadow: '4px 4px 4px #242A3726'}}>{data3}</p>
                            <p style={{fontSize:'12px',color: '#898F9F', margin: training ? "14px 0 76px 0" : '14px 0 55px 0', width: '66px'}}>Кількість днів</p>
                        </div>
                        {training ? (
                            <div>
                                <p style={{fontFamily: '"Open Sans", serif', textAlign: 'center', fontWeight: 700, fontSize: '45px', color: '#FF6B08', margin: '0', width: '66px', height: '66px', margin: '72px 0 0 0', backgroundColor: '#F5F7FA', boxShadow: '4px 4px 4px #242A3726'}}>{reading.length}</p>
                                <p style={{fontSize:'12px',color: '#898F9F', margin: "14px 0 76px 0", width: '66px'}}>Залишилось книжок</p>
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                    {training ? (
                        <div style={{width: '240px', backgroundColor: '#fff', fontFamily: '"Montserrat", serif', fontWeight: 600, color: '#242A37', padding: '24px 16px 0 19px', marginLeft: '41px', boxShadow: '2px 2px 2px #091E3F1A'}}>
                            <p style={{margin: '0 0 0 77px', fontSize: '14px', }}>Результати</p>
                            <div style={{display: 'flex'}}>
                                <p style={{margin: '12px 103px 7px 0', color: '#A6ABB9', fontWeight: 500, fontSize: '11px'}}>Дата</p>
                                <p style={{margin: '12px 0 7px 0', color: '#A6ABB9', fontWeight: 500, fontSize: '11px'}}>Кількість сторінок</p>
                            </div>
                            <input onFocus={() => setFocused4(true)} onBlur={() => setFocused4(false)}  type='date' value={data4} onChange={e => onChangeDate4(e.target.value, 'data4')} style={{cursor: 'pointer', outline: 'none', fontWeight: 400, color: '#242A37', backgroundColor: focused4 ? '#fff' : '#F6F7FB', border: focused4 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 2px', fontSize: '12px', margin: '0 20px 0 0', width:'106px', height: '40px', boxShadow: focused4 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}} />
                            <input type='number' onFocus={() => setFocused5(true)} onBlur={() => setFocused5(false)} value={countPages} onChange={e => onChangePages(e.target.value, 'countPages')} placeholder='...' style={{outline: 'none', fontWeight: 400, color: '#242A37', backgroundColor: focused5 ? '#fff' : '#F6F7FB', border: focused5 ? '0' : '1px solid #A6ABB9', padding: '0 0 0 13px', width:'94px', height: '40px', boxShadow: focused5 ? 'inset 0 1px 2px #1D1D1B26' : 'none'}}  />
                            <button onClick={addDate} style={{color: '#fff', cursor: 'pointer', backgroundColor: '#FF6B08', border: '0', fontSize: '16px', padding: '11px 54px', margin: '20px 0 40px 0'}}>Додати результат</button>
                            <div style={{display: 'flex'}}>
                                <hr style={{margin: '6px 0 0', width: '70px', height: '0', color: '#E0E5EB'}} />
                                <p style={{margin: '0 5px', fontWeight: 700, fontSize: '12px'}}>СТАТИСТИКА</p>
                                <hr style={{margin: '6px 0 0', width: '70px', height: '0', color: '#E0E5EB'}} />
                            </div>
                            {currentUserPages.length === 0 ? (
                                <></>
                            ) : ( currentUserPages.map(page => (
                                    <div style={{display: 'flex', fontWeight: 400, fontSize: '13px', justifyContent: 'space-between'}}>
                                        <p style={{margin: '0 0 0 0'}}>{page.date}</p>
                                        <p style={{color: '#898F9F', margin: '0'}}>{page.time}</p>
                                        <p style={{margin: '0'}}>{page.pages}<span style={{color: '#898F9F'}}> стор.</span></p>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Training;