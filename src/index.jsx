import React, { useContext, useState, useEffect } from 'react';
import { PageState } from './site/pagestate.jsx';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from './site/login.jsx';
import Library from './site/library.jsx'
import Registration from './site/register.jsx';
import Training from './site/training.jsx';
import PrivacyPolicy from './site/docunents/PrivacyPolicy.jsx';
import TermsOfService from './site/docunents/TermsOfService.jsx';
import Enter from './site/enter.jsx';
import { PageStateProvider } from "./site/pagestate.jsx";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const Logined = () => {
  const { currentUser } = useContext(PageState)
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />
}

const Phone = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  useEffect(() => {
      const changeWidth = () => setWindowWidth(window.innerWidth)
      window.addEventListener('resize', changeWidth);
      return () => window.removeEventListener('resize', changeWidth)
  })
  return windowWidth < 768 ? <Outlet /> : <Navigate to="/login" replace />
}

const root = ReactDOM.createRoot(document.getElementById('root')).render(
  <PageStateProvider>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <Routes>
          <Route element={<Phone />}>
            <Route path="*" element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<Enter />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route element={<Logined />}>
            <Route path="/library" element={<Library />} />
            <Route path="/training" element={<Training />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </PageStateProvider>
);

export default root;