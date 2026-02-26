import { Link } from "react-router-dom"

function PrivacyPolicy() {
    return (
        <>
            <header style={{boxShadow: '0 2px 2px #091E3F1A', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center'}}>
                <p style={{fontFamily: '"Abril Fatface", serif', fontWeight: 400, padding: '19px 15px', margin: '0', justifyContent: 'start'}}>BR</p>
                <p style={{fontWeight: 600, fontSize: '18px', color: '#242A37', margin: '0', textDecoration: 'uppercase'}}>
                    Політика конфіденційності для інтернет сайту Book Reading
                </p>
            </header>
            <div style={{fontFamily: 'Montserrat, serif', fontWeight: 400, fontSize: '14px', color: '#242A37', width: '700px', marginLeft: 'calc(50% - 350px)'}}>
                <p style={{fontWeight: 500, fontSize: '16px', margin: '20px 0'}}>
                    Book Reading – це навчальний проект, розроблений для демонстраційних цілей. Я дуже серйозно ставлюся до вашої конфіденційності, навіть у рамках цього навчального проекту.
                </p>
                <p style={{fontWeight: 500,fontSize: '16px', margin: '0'}}>
                    Яку інформацію я збираю:
                </p>
                <p style={{margin: '0'}}>
                    Під час входу через ваш обліковий запис Google, я збираю наступну інформацію з вашого Google профілю, а саме: <br />
                    1. ваше повне ім'я, <br />
                    2. адреса електронної пошти. <br />
                    Пiд час реестрацiї, я збираю збираю наступну iнформацiю: <br />
                    1. введне вами ім'я, <br />
                    2. адреса електронної пошти. <br />
                    Я не збираю будь-яку іншу особисту інформацію, крім зазначеної.
                </p>
                <p style={{fontWeight: 500,fontSize: '16px', margin: '10px 0 0'}}>
                    Як я використову. вашу інформацію:
                </p>
                <p style={{margin: '0'}}>
                    1. Ваше ім'я використовується для відображення вгорі сторінки в роздiлах "бiблiотека" та "тренування".<br />
                    2. Ваша адреса електронної пошти використовується для ідентифікації та аутентифікації вашого облікового запису в Book Reading. <br />
                    3. Ці дані використовуються виключно для функціонування цього інтернет сайту і не використовуються для інших цілей.
                </p>
                <p style={{fontWeight: 500,fontSize: '16px', margin: '10px 0 0'}}>
                    Чи передаю я дані третім сторонам:
                </p>
                <p style={{margin: '0'}}>
                    Я не передаю вашу особисту інформацію жодним третім особам або сервісам.
                </p>
                <p style={{fontWeight: 500,fontSize: '16px', margin: '10px 0 0'}}>           
                    Зберігання даних:
                </p>
                <p style={{margin: '0'}}>
                    Ваші дані зберігаються на мої локальній базі даних. Дані зберігаються до тих пір, поки ви не запросите їх видалення, зв'язавшись зi мною за офіційною адресою: tstmlfrprjcts@gmail.com. Я не гарантую безпеку збереження ваших даних.
                </p>
                <p style={{fontWeight: 500,fontSize: '16px', margin: '10px 0 0'}}>           
                    Зв'язок зi мною:
                </p>
                <p style={{margin: '0'}}>
                    Якщо у вас є запитання щодо цієї політики конфіденційності або використання ваших даних, будь ласка, зв'яжіться зi мною за офіційною адресою: tstmlfrprjcts@gmail.com.
                </p>
                <p style={{fontWeight: 500,fontSize: '16px', margin: '10px 0 0'}}>           
                    Зверніть увагу:
                </p>
                <p style={{margin: '0'}}>
                    Оскільки це навчальний, він може мати обмежений функціонал та не призначений для використання у  комерційних цiлях, усі ризики ви берете на себе. Я залишаю за собою право змінювати цю політику конфіденційності в будь-який час без повідомлення.
                </p>
                <p style={{fontWeight: 500,fontSize: '16px', margin: '10px 0 0'}}>           
                    Останнє оновлення: 26.02.2026
                </p>
                <Link to="/login">
                    <button style={{margin: '20px 0', color: '#fff', backgroundColor: '#FF6B08', border: '0', fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: '14px', padding: '11px 22px', cursor: 'pointer'}}>Перейти головну сторiнку</button>
                </Link>
                <Link to="/registration">
                    <button style={{margin: '20px 0 0 249px', color: '#fff', backgroundColor: '#FF6B08', border: '0', fontFamily: '"Montserrat", serif', fontWeight: 500, fontSize: '14px', padding: '11px 22px', cursor: 'pointer'}}>Перейти до реєстрації</button>
                </Link>
            </div>
        </>
    )
}

export default PrivacyPolicy