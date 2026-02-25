import { React, useState, useContext } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://juniper-fractus-dorethea.ngrok-free.dev/api';
import background_picture_desctop from './pictures/Registration_picture_for_desctop.jpg';
import google_logo from './pictures/google_logo.png';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { PageState } from './pagestate.jsx';

function Registration() {
    const navigate = useNavigate();
    const { loginUser } = useContext(PageState);
    const [register, setRegistration] = useState({ name: '', email: '', password: '', passwordRepeat: '' });
    const onChange = e => {
        const { name, value} = e.target;
        setRegistration(prev => ({...prev, [name]: value}));
    };
    
    const handleGoogleRegisterSuccess = (tokenResponse) => {
        try {
            const id_token = tokenResponse?.credential || tokenResponse?.id_token;
            
            if (!id_token) {
                alert('Помилка: не вдалося отримати токен від Google');
                return;
            }
            
            fetch(`${API_BASE}/googleAuth.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_token: id_token })
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
            alert("Помилка при реєстрації через Google");
        }
    };
    
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    let googleReg = () => alert('Google OAuth не налаштовано');
    if (googleClientId) {
      googleReg = useGoogleLogin({
        onSuccess: handleGoogleRegisterSuccess,
        flow: "implicit"
      });
    }

    const submitData = async () => {
  try {
    const res = await fetch(`${API_BASE}/register.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(register),
    });

    const data = await res.json();

    if (!res.ok) {
      switch (data.error) {
        case "INVALID_NAME":
          alert("Iм'я менше 3 символiв");
          return;
        case "INVALID_EMAIL":
          alert("Некоректна пошта");
          return;
        case "INVALID_PASSWORD":
          alert("Пароль менше 8 символiв");
          return;
        case "PASSWORD_MISMATCH":
          alert("Паролi не спiвпадають");
          return;
        case "USER_EXISTS":
          alert("Такий користувач вже є");
          return;
        default:
          throw new Error("Register failed");
      }
    }

    navigate("/login");
  } catch (err) {
    console.error("Register error:", err);
    alert("Помилка підключення до сервера");
  }
};

    return (
        <div>
            <header>
                <p style={{fontFamily: '"Abril Fatface", serif', fontWeight: 400, padding: '19px 15px', margin: '0', width: '535px'}}>BR</p>
            </header>
            <main style={{display: 'flex'}}>
                <div style={{width: '565px', backgroundImage: `url(${background_picture_desctop})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', height: 'calc(100vh - 60px)', aspectRatio: '113 / 158', width: 'auto' }}>
                    <div style={{ backgroundColor: '#091E3FCC', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div id='registration-form' style={{ backgroundColor: 'white', height: '610px', width: '360px', paddingLeft: '40px'}}>
                            <button 
                                onClick={() => googleReg()} 
                                style={{cursor: 'pointer', fontFamily: '"Roboto", serif', fontWeight: 700, color: '#707375', border: '0', backgroundColor: '#F5F7FA', padding: '11px 49px 11px 14px', display: 'flex', margin: '39px 0 0 85px', boxShadow: '0 2px 2px #091E3F26'}}
                            >
                                <img src={google_logo} alt='G' style={{width: '18px', padding: '0 17px 0 0'}}></img>
                                <p style={{margin: '0'}}>Google</p>
                            </button>
                            <div style={{marginTop: '22px'}}>
                                <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, display: 'flex', margin: '0 0 11px', color: '#898F9F'}}>Ім’я<span style={{margin: '0 0 0 5px', color: '#f00'}}>*</span></p>
                                <input type='text' name='name' value={register.name} onChange={onChange} placeholder='...' style={{fontFamily: '"Montserrat", serif', fontWeight: 400, color: '#A6ABB9', backgroundColor: '#F5F7FA', border: '0', padding: '0 0 0 13px', boxShadow: 'inset 0 1px 2px #1D1D1B26', width:'307px', height: '42px'}} />
                            </div>
                            <div style={{marginTop: '18px'}}>
                                <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, display: 'flex', margin: '0 0 11px', color: '#898F9F'}}>Електронна адреса<span style={{margin: '0 0 0 5px', color: '#f00'}}>*</span></p>
                                <input type='email' name='email' value={register.email} onChange={onChange} placeholder='your@email.com' style={{fontFamily: '"Montserrat", serif', fontWeight: 400, color: '#A6ABB9', backgroundColor: '#F5F7FA', border: '0', padding: '0 0 0 13px', boxShadow: 'inset 0 1px 2px #1D1D1B26', width:'307px', height: '42px'}} />
                            </div>
                            <div style={{marginTop: '18px'}}>
                                <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, display: 'flex', margin: '0 0 11px', color: '#898F9F'}}>Пароль<span style={{margin: '0 0 0 5px', color: '#f00'}}>*</span></p>
                                <input type='password' name='password' value={register.password} onChange={onChange} placeholder='...' style={{fontFamily: '"Montserrat", serif', fontWeight: 400, color: '#A6ABB9', backgroundColor: '#F5F7FA', border: '0', padding: '0 0 0 13px', boxShadow: 'inset 0 1px 2px #1D1D1B26', width:'307px', height: '42px'}} />
                            </div>
                            <div style={{marginTop: '18px'}}>
                                <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, display: 'flex', margin: '0 0 11px', color: '#898F9F'}}>Підтвердити пароль<span style={{margin: '0 0 0 5px', color: '#f00'}}>*</span></p>
                                <input type='password' name='passwordRepeat' value={register.passwordRepeat} onChange={onChange} placeholder='...' style={{fontFamily: '"Montserrat", serif', fontWeight: 400, color: '#A6ABB9', backgroundColor: '#F5F7FA', border: '0', padding: '0 0 0 13px', boxShadow: 'inset 0 1px 2px #1D1D1B26', width:'307px', height: '42px'}} />
                            </div>
                            <button onClick={submitData} style={{cursor: 'pointer', marginTop: '36px', color:'#fff', border: '0', backgroundColor: '#FF6B08', padding: '20px 89px 21px', display: 'flex', justifyContent: 'center'}}><h3 style={{fontFamily: '"Montserrat", serif', fontWeight: 600, margin: '0'}}>Зареєструватися</h3></button>
                            <Link to="/login" style={{textDecoration: 'none'}}>
                                <h5 style={{fontFamily: '"Montserrat", serif', fontWeight: 500, margin: '19px 0 0 92px', color: '#898F9F'}}>Вже з нами? <span style={{textDecoration: 'underline', color: '#FF6B08'}}>Увiйти</span></h5>
                            </Link>
                            </div>
                    </div>
                </div>
                <div style={{flex: '1',display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 2px #091E3F1A', flexDirection: 'column'}}>
                    <p style={{margin: '0', fontFamily: '"Abril Fatface", serif', fontWeight: 400, color: '#242A37', fontSize: '34px'}}>Books Reading</p>
                    <div>
                        <p style={{margin: '64px 0 0', width: '370px', lineHeight: '38px', fontSize: '20px', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500}}>Допоможе вам</p>
                        <p style={{margin: '16px 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Швидше сформулювати свою ціль i розпочати читати</p>
                        <p style={{margin: '0 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Пропорційно розподілити навантаження на кожний день</p>
                        <p style={{margin: '0 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Відстежувати особистий успіх</p>
                        <p style={{margin: '46px 0 0', width: '370px', lineHeight: '38px', fontSize: '20px', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500}}>Також ви зможете</p>
                        <p style={{margin: '30px 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Формувати особисту думку незалежну від інших</p>
                        <p style={{margin: '0 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Підвищити свої професійні якості опираючись на нові знання</p>
                        <p style={{margin: '0 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Стати цікавим співрозмовником</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Registration;