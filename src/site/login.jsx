import React, { useContext, useState, useEffect, useRef } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://juniper-fractus-dorethea.ngrok-free.dev/api';
import background_picture_desctop from './pictures/Registration_picture_for_desctop.jpg';
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
        const handleGoogleLoginSuccess = async (tokenResponse) => {
            try {
                const redirectUri = window.location.origin + '/book-reading/login';
                const res = await fetch(`${API_BASE}/googleAuth.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: tokenResponse.code, redirect_uri: redirectUri })
                });
                const data = await res.json();
                if (!res.ok) {
                    alert(data.error || 'Помилка при вході через Google');
                    return;
                }
                const user = data.user || data;
                loginUser(user);
                localStorage.setItem("currentUser", JSON.stringify(user));
                navigate('/library');
            } catch (err) {
                console.error('Google login error:', err);
                alert('Помилка при вході через Google');
            }
        };
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        let googleLog = () => alert('Google OAuth не налаштовано');
        if (googleClientId) {
            googleLog = useGoogleLogin({
                onSuccess: handleGoogleLoginSuccess,
                flow: "auth-code",
                redirect_uri: window.location.origin + '/book-reading/login'
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
            <main style={{display: 'flex'}}>
                <div style={{backgroundImage: `url(${background_picture_desctop})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', height: 'calc(100vh - 60px)', aspectRatio: '113 / 158', width: 'auto' }}>
                    <div style={{ backgroundColor: '#091E3FCC', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div id='login-form' style={{ backgroundColor: 'white', height: '420px', width: '360px', paddingLeft: '40px'}}>
                            <button onClick={() => googleLog()} style={{cursor: 'pointer', fontFamily: '"Roboto", serif', fontWeight: 700, color: '#707375', border: '0', backgroundColor: '#F5F7FA', padding: '11px 49px 11px 14px', display: 'flex', margin: '39px 0 0 85px', boxShadow: '0 2px 2px #091E3F26'}}><img src={google_logo} alt='G'style={{width: '18px', padding: '0 17px 0 0'}}></img><p style={{margin: '0'}}>Google</p></button>
                            <div style={{marginTop: '22px'}}>
                                <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, display: 'flex', margin: '0 0 11px', color: '#898F9F'}}>Електронна адреса<span style={{margin: '0 0 0 5px', color: '#f00'}}>*</span></p>
                                <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='your@email.com' style={{fontFamily: '"Montserrat", serif', fontWeight: 400, color: '#A6ABB9', backgroundColor: '#F5F7FA', border: '0', padding: '0 0 0 13px', boxShadow: 'inset 0 1px 2px #1D1D1B26', width:'307px', height: '42px'}} />
                            </div>
                            <div style={{marginTop: '18px'}}>
                                <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, display: 'flex', margin: '0 0 11px', color: '#898F9F'}}>Пароль<span style={{margin: '0 0 0 5px', color: '#f00'}}>*</span></p>
                                <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Пароль' style={{fontFamily: '"Montserrat", serif', fontWeight: 400, color: '#A6ABB9', backgroundColor: '#F5F7FA', border: '0', padding: '0 0 0 13px', boxShadow: 'inset 0 1px 2px #1D1D1B26', width:'307px', height: '42px'}} />
                            </div>
                            <button onClick={loginClick} style={{cursor: 'pointer', marginTop: '30px', color:'#fff', border: '0', backgroundColor: '#FF6B08', padding: '22px 133px', display: 'flex', justifyContent: 'center'}}><h3 style={{fontFamily: '"Montserrat", serif', fontWeight: 600, margin: '0'}}>Увійти</h3></button>
                            <Link to="/registration">
                                <h5 style={{fontFamily: '"Montserrat", serif', fontWeight: 500, textDecoration: 'underline', color: '#FF6B08', margin: '19px 0 0 122px'}}>Реєстрація</h5>
                            </Link>
                        </div>
                    </div>
                </div>
                <div style={{flex: '1',display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 2px #091E3F1A', flexDirection: 'column'}}>
                    <p style={{margin: '0', fontFamily: '"Abril Fatface", serif', fontWeight: 400, color: '#FF6B08', fontSize: '59px'}}>"</p>
                    <h2 style={{margin: '0', textAlign: 'center', width: '370px', lineHeight: '38px', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500}}>Книги - це кораблi думки, що мандрують по хвилям часу, й обережно несуть свiй цiнний вантаж вiд поколiння до поколiння. </h2>
                    <hr style={{color: '#242A3780', width: '150px', margin: '28px 0 12px'}} />
                    <p style={{margin: '0', color: '#898F9F', fontFamily: '"Montserrat", serif', fontWeight: 500}}>Бэкон Ф.</p>
                </div>
            </main>
        </div>
    );
};

export default Login;