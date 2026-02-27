import React, { useContext, useState, useEffect, useRef } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE;
import background_picture_desctop from './pictures/Registration_picture_for_desctop.jpg';
import background_picture_pad from './pictures/Registration_picture_for_pad.jpg';
import background_picture_phone from './pictures/Registration_picture_for_phone.jpg';
import google_logo from './pictures/google_logo.png';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { PageState } from './pagestate.jsx';
import { useGoogleLogin } from '@react-oauth/google';

function Login() {
    const { loginUser } = useContext(PageState);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    useEffect(() => {
        const changeWidth = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', changeWidth);
        return () => window.removeEventListener('resize', changeWidth)
    })
    const isPad = windowWidth < 1280 && windowWidth > 768;
    const isPhone = windowWidth < 768;
    const handleGoogleLoginSuccess = (credentialResponse) => {
        try {
            const id_token = credentialResponse?.credential 
                || credentialResponse?.id_token
                || null;
            const access_token = credentialResponse?.access_token || null;
            if (!id_token && !access_token) {
                alert('Помилка: не вдалося отримати токен від Google');
                return;
            }
            const body = { action: 'login' };
            if (id_token) body.id_token = id_token;
            if (access_token) body.access_token = access_token;
            fetch(`${API_BASE}/googleAuth.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    loginUser(data.user);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    navigate('/library');
                } else {
                    alert('Помилка: ' + (data.error || 'невідома помилка'));
                }
            })
            .catch(err => {
                alert('Помилка підключення до сервера');
            });
        } catch (err) {
            alert('Помилка при вході через Google');
        }
    };    
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    let googleLogin = () => alert('Google OAuth не налаштовано');
    if (googleClientId) {
        googleLogin = useGoogleLogin({
            onSuccess: handleGoogleLoginSuccess,
            flow: "implicit"
        });
    }
    const loginClick = async () => {
    try {
    const res = await fetch(`${API_BASE}/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "USER_NOT_FOUND") {
        alert("Користувача з такою поштою не існує!");
        return;
      }
      if (data.error === "WRONG_PASSWORD") {
        alert("Неправильний пароль!");
        return;
      }
      throw new Error("Login failed");
    }
    loginUser(data);
    localStorage.setItem("currentUser", JSON.stringify(data));
    navigate("/library");
  } catch (err) {
    console.error("Login error:", err);
    alert("Помилка підключення до сервера");
  }
};
    return (
        <div>
            <header>
                <p style={{fontFamily: '"Abril Fatface", serif', fontWeight: 400, padding: '19px 15px', margin: '0', width: '535px'}}>BR</p>
            </header>
            <main style={{display: isPhone ? 'block' : (isPad ? 'block': 'flex')}}>
                <div style={{backgroundImage: isPhone ? `url(${background_picture_phone})` : (isPad ? `url(${background_picture_pad})` : `url(${background_picture_desctop})`), backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', aspectRatio: isPhone ? '80 / 147' : (isPad ? '384 / 365' : '113 / 178'), height: isPhone ? 'auto' : (isPad ? 'auto' : 'calc(100vh - 60px)'), width: isPhone ? '100%' : (isPad ? '100%' : 'auto') }}>
                    <div style={{ backgroundColor: '#091E3FCC', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div id='login-form' style={{ backgroundColor: isPhone ? '' : '#fff', height: '440px', width: isPhone ? '270px' :'360px', paddingLeft: isPhone ? '0' : '40px'}}>
                            <button 
                                onClick={() => googleLogin()} 
                                style={{cursor: 'pointer', fontFamily: '"Roboto", serif', fontWeight: 700, color: '#707375', border: '0', backgroundColor: '#F5F7FA', padding: '11px 49px 11px 14px', display: 'flex', margin: isPhone ? '30px 0 0 60px' : '39px 0 0 85px', boxShadow: '0 2px 2px #091E3F26'}}
                            >
                                <img src={google_logo} alt='G' style={{width: '18px', padding: '0 17px 0 0'}}></img>
                                <p style={{margin: '0'}}>Google</p>
                            </button>
                            <div style={{marginTop: '22px'}}>
                                <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, display: 'flex', margin: '0 0 11px', color: isPhone ? '#fff' : '#898F9F'}}>Електронна адреса<span style={{margin: '0 0 0 5px', color: '#f00'}}>*</span></p>
                                <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='your@email.com' style={{fontFamily: '"Montserrat", serif', fontWeight: 400, color: '#A6ABB9', backgroundColor: '#F5F7FA', border: '0', padding: '0 0 0 13px', boxShadow: 'inset 0 1px 2px #1D1D1B26', width: isPhone ? '257px' : '307px', height: '42px'}} />
                            </div>
                            <div style={{marginTop: '18px'}}>
                                <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, display: 'flex', margin: '0 0 11px', color: isPhone ? '#fff' : '#898F9F'}}>Пароль<span style={{margin: '0 0 0 5px', color: '#f00'}}>*</span></p>
                                <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Пароль' style={{fontFamily: '"Montserrat", serif', fontWeight: 400, color: '#A6ABB9', backgroundColor: '#F5F7FA', border: '0', padding: '0 0 0 13px', boxShadow: 'inset 0 1px 2px #1D1D1B26', width: isPhone ? '257px' : '307px', height: '42px'}} />
                            </div>
                            <button onClick={loginClick} style={{cursor: 'pointer', marginTop: '30px', color:'#fff', border: '0', backgroundColor: '#FF6B08', padding: isPhone ? '22px 108px' : '22px 133px', display: 'flex', justifyContent: 'center'}}><h3 style={{fontFamily: '"Montserrat", serif', fontWeight: 600, margin: '0'}}>Увійти</h3></button>
                            <Link to="/registration">
                                <h5 style={{fontFamily: '"Montserrat", serif', fontWeight: 500, textDecoration: 'underline', color: '#FF6B08', margin: isPhone ? '19px 0 0 90px' : '19px 0 0 122px'}}>Реєстрація</h5>
                            </Link>
                            <div style={{display: isPhone ? 'block' : 'flex'}}>
                                <Link to="/terms-of-service" style={{ textDecoration: 'none'}}>
                                    <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: isPhone ? '14px' : '12px',color: '#FF6B08', margin: isPhone ? '25px 0' : '15px 0'}}>Умови використання</p>
                                </Link>
                                <Link to="/privacy-policy" style={{ textDecoration: 'none'}}>
                                    <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: isPhone ? '14px' : '12px', color: '#FF6B08', margin: isPhone ? '25px 0' : '15px 0 0 15px'}}>Політика конфіденційності</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{flex: '1',display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 2px #091E3F1A', flexDirection: 'column'}}>
                    <p style={{margin: isPhone ? '25px 0 0' : (isPad ? '75px 0 0' :'0'), fontFamily: '"Abril Fatface", serif', fontWeight: 400, color: '#FF6B08', fontSize: '59px'}}>"</p>
                    <h2 style={{margin: '0', textAlign: 'center', width: isPhone ? '280px' : (isPad ? '526px' : '370px'), fontSize: isPhone ? '16px' : '24px', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500}}>Книги - це кораблi думки, що мандрують по хвилям часу, й обережно несуть свiй цiнний вантаж вiд поколiння до поколiння. </h2>
                    <hr style={{color: '#242A3780', width: '150px', margin: '28px 0 12px'}} />
                    <p style={{margin: isPhone ? ' 0 0 25px' : (isPad ? '0 0 75px' :'0'), color: '#898F9F', fontFamily: '"Montserrat", serif', fontWeight: 500}}>Бэкон Ф.</p>
                </div>
            </main>
        </div>
    );
};

export default Login;