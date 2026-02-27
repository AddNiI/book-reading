import { Link } from 'react-router-dom';

function Enter () {
    return(
        <>
            <header>
                <p style={{fontFamily: '"Abril Fatface", serif', fontWeight: 400, padding: '19px 15px', margin: '0', width: '535px'}}>BR</p>
            </header>
            <div style={{flex: '1',display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 2px #091E3F1A', flexDirection: 'column'}}>
                <p style={{margin: '0', fontFamily: '"Abril Fatface", serif', fontWeight: 400, color: '#242A37', fontSize: '34px', margin: '30px auto 0'}}>Books Reading</p>
                <div >
                    <p style={{margin: '64px 0 0', width: 'calc(100vw - 50px)', lineHeight: '38px', fontSize: '20px', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500}}>Допоможе вам</p>
                    <p style={{margin: '16px 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Швидше сформулювати свою ціль i розпочати читати</p>
                    <p style={{margin: '0 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Пропорційно розподілити навантаження на кожний день</p>
                    <p style={{margin: '0 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Відстежувати особистий успіх</p>
                    <p style={{margin: '46px 0 0', width: 'calc(100vw - 50px)', lineHeight: '38px', fontSize: '20px', color: '#242A37', fontFamily: '"Montserrat", serif', fontWeight: 500}}>Також ви зможете</p>
                    <p style={{margin: '30px 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Формувати особисту думку незалежну від інших</p>
                    <p style={{margin: '0 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Підвищити свої професійні якості опираючись на нові знання</p>
                    <p style={{margin: '0 0 20px', fontFamily: '"Montserrat", serif', fontSize: '14px', fontWeight: 500, color: '#898F9F'}}><span style={{color: '#FF6B08'}}>></span> Стати цікавим співрозмовником</p>
                </div>
            </div>
            <Link to="/login">
                <button style={{backgroundColor: "#fff", border: '1px solid #242A37', marginLeft: '25px', width: '127px', height: '40px', cursor: 'pointer'}}>Увiйти</button>                                
            </Link>
            <Link to="/registration">
                <button style={{margin: '20px 0 0 calc(100vw - 302px)', color: '#fff', backgroundColor: '#FF6B08', border: '0', fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: '14px', padding: '11px 23px', cursor: 'pointer'}}>Реєстрація</button>
            </Link>
        </>
    )
}

export default Enter