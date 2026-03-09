import { useState, useCallback, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageState } from "./pagestate.jsx";
import { Navigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { useGoogleLogin } from "@react-oauth/google";
import google_logo from './pictures/google_logo.png';
const API_BASE = import.meta.env.VITE_API_BASE;

function Modal({ children, onClose }) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    useEffect(() => {
        const changeWidth = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', changeWidth);
        return () => window.removeEventListener('resize', changeWidth)
    })
    const isPhone = windowWidth < 768;
    return (
        <div onClick={onClose} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000}}>
            <div onClick={(e)=>e.stopPropagation()} style={{background:"#fff", width: isPhone ? '250px' : "390px", padding: isPhone ? '10px' : "30px"}}>
                {children}
            </div>
        </div>
    );
}

function UserPage() {
    const [uploading, setUploading] = useState(false);
    const [image, setImage] = useState(null);
    const [crop, setCrop] = useState({x:0, y:0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [newMail, setNewMail] = useState("");
    const [newName, setNewName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [focused1,setFocused1] = useState(false)
    const [focused2,setFocused2] = useState(false)
    const [focused3,setFocused3] = useState(false)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const [googleConfirmed, setGoogleConfirmed] = useState(false);
    useEffect(() => {
        const changeWidth = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', changeWidth);
        return () => window.removeEventListener('resize', changeWidth)
    })
    const isPhone = windowWidth < 768;
    const { currentUser, setCurrentUser } = useContext(PageState);
    const name = currentUser?.name || '';
    const firstLetter = name.trim().charAt(0).toUpperCase();
    if(!currentUser) return <Navigate to="/login" />;
    const onCropComplete = useCallback((_, croppedPixels)=>{
        setCroppedAreaPixels(croppedPixels);
    },[]);
    const createImage = (url)=> new Promise((resolve)=>{
        const img = new Image();
        img.src = url;
        img.onload = ()=> resolve(img);
    });
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const body = {
                action:"login"
            };
            if(tokenResponse.access_token){
                body.access_token = tokenResponse.access_token;
            }
            const res = await fetch(`${API_BASE}/googleAuth.php`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(body)
            });
            const data = await res.json();
            if(data.success){
                setPasswordConfirm("GOOGLE_AUTH");
                setGoogleConfirmed(true);
            }
        }
    });
    const getCroppedImg = async ()=>{
        const img = await createImage(image);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 400;
        canvas.height = 400;
        ctx.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, 400, 400);
        return new Promise((resolve)=>{
            canvas.toBlob((blob)=> resolve(blob), "image/jpeg", 0.8);
        });
    };
    const handleFileSelect = (e)=>{
        const file = e.target.files[0];
        if(!file) return;
        setImage(URL.createObjectURL(file));
    };
    const handleSaveAvatar = async ()=>{
        if(!croppedAreaPixels) return;
        setUploading(true);
        const croppedBlob = await getCroppedImg();
        const formData = new FormData();
        formData.append("image", croppedBlob);
        formData.append("userId", currentUser.id);
        formData.append("oldIcon", currentUser.Icon || "");
        const res = await fetch(`${API_BASE}/addIcon.php`,{method:"POST", body:formData});
        const data = await res.json();
        if(data.Icon){
            const updatedUser = {...currentUser, Icon:data.Icon};
            setCurrentUser(updatedUser);
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
        setImage(null);
        setUploading(false);
    };
    const confirmAction = async ()=>{
        let endpoint="";
        let body={userId: currentUser.id, currentPassword:passwordConfirm};
        if(modalType==="mail"){
            endpoint="changeMail.php";
            body.mail=newMail;
        }
        if(modalType==="name"){
            endpoint="changeName.php";
            body.name=newName;
        }
        if(modalType==="password"){
            if(newPassword!==repeatPassword){
                alert("Паролі не співпадають");
                return;
            }
            endpoint="changePassword.php";
            body.newPassword=newPassword;
        }
        if(modalType==="delete"){
            endpoint="deleteUser.php";
        }
        const res = await fetch(`${API_BASE}/${endpoint}`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(body)
        });
        const data = await res.json();
        if(data.success){
            if(modalType==="mail"){
                const updatedUser={...currentUser, email:newMail};
                setCurrentUser(updatedUser);
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            }
            if(modalType==="name"){
                const updatedUser={...currentUser, name:newName};
                setCurrentUser(updatedUser);
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            }
            if(modalType==="delete"){
                localStorage.removeItem("currentUser");
                window.location.href="/login";
            }
            setModalType(null);
            setPasswordConfirm("");
        }
    };
    return (
        <div>
            <header style={{padding: '12px 15px', gridTemplateColumns: '1fr auto 1fr', boxShadow: '0 2px 2px #091E3F1A', backgroundColor: '#FFF', display: 'grid', alignItems: 'center', position: 'fixed', width: 'calc(100vw - 30px)', zIndex: 100}}>
                <Link to="/library" style={{textDecoration: 'none', color: '#000'}}><p style={{fontFamily: '"Abril Fatface", serif', fontWeight: 400, margin: '0', justifyContent: 'start'}}>BR</p></Link>
                <div style={{justifyContent: 'center', display: 'flex', alignItems: 'center'}}>
                    {isPhone ? (<></>) : (
                        <>
                            {currentUser?.Icon ? (
                                <Link to={'/user'} style={{textDecoration: 'none', cursor: 'pointer'}}>
                                    <img src={currentUser.Icon} alt="avatar" style={{ width: 33, height: 33, borderRadius: "50%", margin: "0 12px 0 0", objectFit: "cover" }}/>
                                </Link>
                            ) : (
                                <Link to={'/user'} style={{textDecoration: 'none', cursor: 'pointer'}}>
                                    <div style={{ width: 33, height: 33, borderRadius: "50%", background: "#F5F7FA", margin: "0 12px 0 0", display: "inline-flex", alignItems: "center", justifyContent: "center"}}>
                                        <p style={{ margin: 0, fontFamily: '"Montserrat", serif', fontWeight: 600, color: "#242A37"}}>{firstLetter}</p>
                                    </div>
                                </Link>
                            )}
                            <Link to={'/user'} style={{textDecoration: 'none', cursor: 'pointer'}}>
                                <p style={{fontFamily: '"Montserrat", serif', fontWeight: 300, color: '#242A37', margin: '0'}}>{name}</p>
                            </Link>
                        </>
                    )}
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
                    {!isPhone ? (<></>) : (currentUser?.Icon) ? (
                        <Link to={'/user'} style={{textDecoration: 'none', cursor: 'pointer'}}>
                            <img src={currentUser.Icon} alt="avatar" style={{ width: 33, height: 33, borderRadius: "50%", margin: "0 0 0 12px", objectFit: "cover" }}/>
                        </Link>
                    ) : (
                        <Link to={'/user'} style={{textDecoration: 'none', cursor: 'pointer'}}>
                            <div style={{ width: 33, height: 33, borderRadius: "50%", background: "#F5F7FA", margin: "0 0 0 12px", display: "inline-flex", alignItems: "center", justifyContent: "center"}}>
                                <p style={{ margin: 0, fontFamily: '"Montserrat", serif', fontWeight: 600, color: "#242A37"}}>{firstLetter}</p>
                            </div>
                        </Link>
                    )}
                    <Link to={'/login'}>
                        <p onClick={()=>{localStorage.removeItem("currentUser"); setCurrentUser(null);}} style={{fontFamily: '"Montserrat", serif', fontWeight: 300, color: '#242A37', margin: '7px 13px 0 14px', textDecoration: 'underline'}}>Вихiд</p>
                    </Link>
                </div>
            </header>
            <main style={{backgroundColor: '#F6F7FB', minHeight: '100vh', height: '100%', padding: isPhone ? '60px calc(50vw - 135px) 0' : '60px calc(50vw - 300px) 0', width: isPhone ? '270px' : '600px'}}>
                <div style={{backgroundColor: '#fff', boxShadow: '2px 2px 2px #091E3F1A', marginTop: '30px'}}>
                    <div style={{display: 'flex'}}>                                    
                        <label style={{cursor: "pointer"}}>
                            {currentUser.Icon ? <img src={currentUser.Icon} alt="avatar" width={isPhone ? '50' : "75"} style={{borderRadius: "50%", margin: isPhone ? '10px 10px 0' : "10px 10px 0 30px"}} /> : (
                                <div style={{ width: isPhone ? 50 : 75, height: isPhone ? 50 : 75, borderRadius: "50%", background: "#F5F7FA", margin: isPhone ? '10px 10px 0' : "10px 10px 0 30px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: 'pointer'}}>
                                    <p style={{ margin: 0, fontFamily: '"Montserrat", serif', fontSize: '40px', fontWeight: 600, color: "#242A37"}}>{firstLetter}</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileSelect} style={{display: "none"}} />
                        </label>
                        <h2 style={{margin: isPhone ? '24px 10px 0 0' : '30px 30px 0 0', width: isPhone ? '190px' : '455px', fontSize: isPhone ? '16px' : ''}}>{currentUser.name}</h2>
                    </div>
                    {image && (
                        <Modal onClose={()=>setImage(null)}>
                            <div style={{position:"relative", width: isPhone ? 250 : 390, height: isPhone ? 250 : 390}}>
                                <Cropper image={image} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}/>
                            </div>
                            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e)=>setZoom(Number(e.target.value))} style={{width:"100%",marginTop:"15px",accentColor:"#FF6B08",background:"#fff",border:"none",outline:"none",cursor:"pointer",height:"20px"}}/>
                            <div style={{display:"flex", justifyContent:"space-between", marginTop:"20px"}}>
                                <button onClick={()=>setImage(null)} style={{background:"#fff",border:"1px solid #242A37",width:isPhone ? '110px' : "130px",height:"40px",cursor:"pointer",fontFamily:'"Montserrat", serif'}}>Скасувати</button>
                                <button disabled={uploading} onClick={handleSaveAvatar} style={{color:"#fff",background:"#FF6B08",border:"0",padding:isPhone ? "11px 25px" : '11px 35px',cursor:"pointer",fontFamily:'"Montserrat", serif'}}>Зберегти</button>
                            </div>
                        </Modal>
                    )}
                    <button onClick={()=>setModalType("mail")} style={{backgroundColor:"#fff",border:"1px solid #242A37",width:"200px",height:"42px",cursor:"pointer",fontFamily:'"Montserrat", serif',margin: isPhone ? '10px calc(50% - 100px)' : "10px 30px"}}>змiнити пошту</button>
                    <button onClick={()=>setModalType("name")} style={{backgroundColor:"#fff",border:"1px solid #242A37",width:"200px",height:"42px",cursor:"pointer",fontFamily:'"Montserrat", serif',margin: isPhone ? '0 calc(50% - 100px) 10px' : "0 30px 10px 110px"}}>змiнити iм'я</button>
                    <button onClick={()=>setModalType("password")} style={{backgroundColor:"#fff",border:"1px solid #242A37",width:"200px",height:"42px",cursor:"pointer",fontFamily:'"Montserrat", serif',margin: isPhone ? '0 calc(50% - 100px) 10px' : "0 30px 10px"}}>змiнити пароль</button>
                    <button onClick={()=>setModalType("delete")} style={{border: '0',color:"#fff", backgroundColor:"#FF6B08",width:"200px",height:"42px",cursor:"pointer",fontFamily:'"Montserrat", serif',margin: isPhone ? '0 calc(50% - 100px) 30px' : "0 30px 30px 110px"}}>видалити аккаунт</button>
                </div>
                {modalType && (
                    <Modal onClose={()=>setModalType(null)}>
                        {modalType==="mail" && (
                            <>
                                <p style={{margin: '0'}}>Нова пошта</p>
                                <input onFocus={()=>setFocused1(true)} onBlur={()=>setFocused1(false)} value={newMail} onChange={(e)=>setNewMail(e.target.value)}  style={{outline:'none',fontWeight:400,color:'#242A37',backgroundColor: '#fff',border:focused1 ? '0' : '1px solid #A6ABB9',padding:'0 0 0 13px',marginBottom:'15px',width: isPhone ? (focused1 ? '237px' : '235px') : (focused1 ? '377px' : '375px'),height:focused1 ? '44px' : '42px',boxShadow:focused1 ? 'inset 0 1px 2px #1D1D1B26' : 'none',fontFamily:'"Montserrat", serif'}}/>
                            </>
                        )}
                        {modalType==="name" && (
                            <>
                                <p style={{margin: '0'}}>Нове iм'я</p>
                                <input onFocus={()=>setFocused1(true)} onBlur={()=>setFocused1(false)} value={newName} onChange={(e)=>setNewName(e.target.value)}  style={{outline:'none',fontWeight:400,color:'#242A37',backgroundColor: '#fff',border:focused1 ? '0' : '1px solid #A6ABB9',padding:'0 0 0 13px',marginBottom:'15px',width: isPhone ? (focused1 ? '237px' : '235px') : (focused1 ? '377px' : '375px'),height:focused1 ? '44px' : '42px',boxShadow:focused1 ? 'inset 0 1px 2px #1D1D1B26' : 'none',fontFamily:'"Montserrat", serif'}}/>
                            </>
                        )}
                        {modalType==="password" && (
                            <>
                                <p style={{margin: '0'}}>Новий пароль</p>
                                <input onFocus={()=>setFocused1(true)} onBlur={()=>setFocused1(false)} type="password" autoComplete="new-password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} style={{outline:'none',fontWeight:400,color:'#242A37',backgroundColor: '#fff',border:focused1 ? '0' : '1px solid #A6ABB9',padding:'0 0 0 13px',marginBottom:'15px',width: isPhone ? (focused1 ? '237px' : '235px') : (focused1 ? '377px' : '375px'),height:focused1 ? '44px' : '42px',boxShadow:focused1 ? 'inset 0 1px 2px #1D1D1B26' : 'none',fontFamily:'"Montserrat", serif'}}/>
                                <p style={{margin: '0'}}>Повтор нового пароля</p>
                                <input onFocus={()=>setFocused2(true)} onBlur={()=>setFocused2(false)} type="password" autoComplete="new-password" value={repeatPassword} onChange={(e)=>setRepeatPassword(e.target.value)} style={{outline:'none',fontWeight:400,color:'#242A37',backgroundColor: '#fff',border:focused2 ? '0' : '1px solid #A6ABB9',padding:'0 0 0 13px',marginBottom:'15px',width: isPhone ? (focused2 ? '237px' : '235px') : (focused2 ? '377px' : '375px'),height:focused2 ? '44px' : '42px',boxShadow:focused2 ? 'inset 0 1px 2px #1D1D1B26' : 'none',fontFamily:'"Montserrat", serif'}}/>
                            </>
                        )}
                        {modalType==="delete" && (
                            <p style={{margin: '0 0 20px'}}>Ви впевнені що хочете видалити акаунт?</p>
                        )}
                        <p style={{margin: '0'}}>Введiть поточний пароль</p>
                        <input type="password" disabled={googleConfirmed} autoComplete="new-password" value={passwordConfirm} onFocus={()=>setFocused3(true)} onBlur={()=>setFocused3(false)} onChange={(e)=>setPasswordConfirm(e.target.value)} style={{outline:'none',fontWeight:400,color:'#242A37',backgroundColor: '#fff',border:focused3 ? '0' : '1px solid #A6ABB9',padding:'0 0 0 13px',marginBottom:'15px',width: isPhone ? (focused3 ? '237px' : '235px') : (focused3 ? '377px' : '375px'),height:focused3 ? '44px' : '42px',boxShadow:focused3 ? 'inset 0 1px 2px #1D1D1B26' : 'none',fontFamily:'"Montserrat", serif'}}/>
                        {currentUser.Google === 1 && (
                            <button onClick={() => googleLogin()} style={{cursor:'pointer',fontFamily:'"Roboto", serif',fontWeight:700,color:'#707375',border:'0',backgroundColor:'#F5F7FA',padding:'11px 20px 11px 14px',display:'flex',margin: isPhone ? '10px 0' : '10px 0 10px 76px',boxShadow:'0 2px 2px #091E3F26'}}>
                                <img src={google_logo} alt='G' style={{width: isPhone ? '32px' : '18px', padding:'0 10px 0 0'}}/>
                                <p style={{margin:0}}>Або підтвердити через Google</p>
                            </button>
                        )}
                        <button onClick={()=>setModalType(null)} style={{background:"#fff",border:"1px solid #242A37",width:isPhone ? '110px' : "130px",height:"40px",cursor:"pointer",fontFamily:'"Montserrat", serif',margin: isPhone ? "0 24px 0 0" : " 0 20px 0 calc(50% - 155px)"}}>Скасувати</button>
                        <button onClick={confirmAction} style={{color:"#fff",background:"#FF6B08",border:"0",padding:isPhone ? '12px 13px' : "12px 35px",cursor:"pointer",fontFamily:'"Montserrat", serif',fontWeight:500}}>Підтвердити</button>
                    </Modal>
                )}
            </main>
        </div>
    );
}
export default UserPage;