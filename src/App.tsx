// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage'; 
import DashboardPage from './components/DashboardPage';
import { AuthGuard } from './components/AuthGuard'; 

function App() {
    return (
        <Router>
            <Routes>
                {/* Ruta de Login */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Ruta del Dashboard - PROTEGIDA */}
                <Route 
                    path="/dashboard/:studentId" 
                    element={
                        <AuthGuard>
                            <DashboardPage />
                        </AuthGuard>
                    } 
                />
                
                {/* Ruta por defecto: ¡CORREGIDA! Pasa el componente directamente. */}
                <Route path="/" element={<Navigate replace to="/login" />} /> 
            </Routes>
        </Router>
    );
}

export default App;