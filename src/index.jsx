import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from './site/login.jsx';
import Library from './site/library.jsx'
import Registration from './site/register.jsx';
import Training from './site/training.jsx';
import { PageStateProvider } from "./site/pagestate.jsx"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root')).render(
  <PageStateProvider>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
            <Route path="*" element={<Navigate to="/book-reading/login" replace />} />
            <Route path="/book-reading/login" element={<Login />} />
            <Route path="/book-reading/library" element={<Library />} />
            <Route path="/book-reading/registration" element={<Registration />} />
            <Route path="/book-reading/training" element={<Training />} />
      </Routes>
    </BrowserRouter>
  </PageStateProvider>
);