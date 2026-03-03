import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Enter() {
    const navigate = useNavigate();
    useEffect(() => {
        try {
            const raw = localStorage.getItem('currentUser');
            const saved = raw ? JSON.parse(raw) : null;
            saved ? navigate('/library') : null;
        } catch (e) {
            null
        }
    })
    return(
        <>
            <header>
                <p style={{fontFamily: '"Abril Fatface", serif', fontWeight: 400, padding: '19px 15px', margin: '0', width: 'calc(100vw - 30px)', boxShadow: '0 2px 2px #091E3F1A'}}>BR</p>
            </header>
            <main style={{width: 'calc(100vw - 50px)', maxWidth: '480px', margin: '0 auto'}}>
                <div style={{flex: '1',display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                    <p style={{margin: '0', fontFamily: '"Abril Fatface", serif', fontWeight: 400, color: '#242A37', fontSize: '34px', maxWidth: '480px', margin: '30px auto 0'}}>Books Reading</p>
                    <div >
                        <p style={{margin: '64px 0 0', width: 'calc(100vw - 50px)', maxWidth: '480px', lineHeight: '38px', fontSize: '20px', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500}}>Допоможе вам</p>
                        <p style={{margin: '16px 0 20px', fontFamily: '"Montserrat", serif', maxWidth: '480px', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Швидше сформулювати свою ціль i розпочати читати</p>
                        <p style={{margin: '0 0 20px', fontFamily: '"Montserrat", serif', maxWidth: '480px', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Пропорційно розподілити навантаження на кожний день</p>
                        <p style={{margin: '0 0 20px', fontFamily: '"Montserrat", serif', maxWidth: '480px', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Відстежувати особистий успіх</p>
                        <p style={{margin: '46px 0 0', width: 'calc(100vw - 50px)', maxWidth: '480px', lineHeight: '38px', fontSize: '20px', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500}}>Також ви зможете</p>
                        <p style={{margin: '30px 0 20px', maxWidth: '480px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Формувати особисту думку незалежну від інших</p>
                        <p style={{margin: '0 0 20px', maxWidth: '480px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Підвищити свої професійні якості опираючись на нові знання</p>
                        <p style={{margin: '0 0 20px', maxWidth: '480px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Стати цікавим співрозмовником</p>
                    </div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr auto 1fr'}}>
                    <Link to="/login" style={{justifyContent: 'start'}}>
                        <button style={{backgroundColor: "#fff", border: '1px solid #242A37', width: '127px', height: '40px', cursor: 'pointer'}}>Увiйти</button>                                
                    </Link>
                    <div style={{justifyContent: 'center'}}></div>
                    <Link to="/registration" style={{margin: '0 0 0 auto',justifyContent: 'end'}}>
                        <button style={{ color: '#fff', backgroundColor: '#FF6B08', border: '0', fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: '14px', padding: '11px 23px', cursor: 'pointer'}}>Реєстрація</button>
                    </Link>
                </div>
                <div>
                    <Link to="/terms-of-service" style={{ textDecoration: 'none'}}>
                        <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: '14px',color: '#FF6B08'}}>Умови використання</p>
                    </Link>
                    <Link to="/privacy-policy" style={{ textDecoration: 'none'}}>
                        <p style={{fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: '14px', color: '#FF6B08'}}>Політика конфіденційності</p>
                    </Link>
                </div>
            </main>
        </>
    )
}

export default Enter