// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
// Debes crear estos componentes en src/components/
import LoginPage from './components/LoginPage'; 
import DashboardPage from './components/DashboardPage';
import AdminPage from './components/AdminPage';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* La ruta base y /login van al mismo componente */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* El ID del estudiante es dinámico */}
        <Route path="/dashboard/:studentId" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)