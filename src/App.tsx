// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // <<-- ¡AQUÍ ESTÁ EL ARREGLO!
import LoginPage from './components/LoginPage'; 
import DashboardPage from './components/DashboardPage';
import { AuthGuard } from './components/AuthGuard'; // Asegúrate que la ruta sea correcta

function App() {
    return (
        <Router>
            <Routes>
                {/* Ruta de Login - Abierta a todos */}
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
                
                {/* Ruta por defecto: Redirige a /login */}
                <Route path="/" element={<Navigate replace to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;