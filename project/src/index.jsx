import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './site/login.jsx';
import Library from './site/library.jsx'
import Registration from './site/register.jsx';
import Training from './site/training.jsx';
import { LoginsStateProvider } from "./site/loginsstate.jsx"
import { BooksStateProvider } from "./site/booksstate.jsx"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PagesStateProvider } from './site/pagesstate.jsx';

const root = ReactDOM.createRoot(document.getElementById('root')).render(
  <LoginsStateProvider>
    <BooksStateProvider>
      <PagesStateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/library" element={<Library />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/training" element={<Training />} />
          </Routes>
        </BrowserRouter>
      </PagesStateProvider>
    </BooksStateProvider>
  </LoginsStateProvider>
);