// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage'; 
import DashboardPage from './components/DashboardPage';
// ¡CORRECCIÓN CLAVE! Importa SIN llaves {}
import AuthGuard from './components/AuthGuard'; 

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                
                <Route 
                    path="/dashboard/:studentId" 
                    element={
                        <AuthGuard>
                            <DashboardPage />
                        </AuthGuard>
                    } 
                />
                
                <Route path="/" element={<Navigate replace to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;