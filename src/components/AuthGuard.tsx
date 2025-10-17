// src/components/AuthGuard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// <<-- ¡SOLUCIÓN A TS2304! DEFINICIÓN DE LA INTERFAZ FALTANTE -->>
interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    // Inicializa en true. Siempre debe cargar al menos una vez para verificar la sesión.
    const [isLoading, setIsLoading] = useState(true); 
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true; 

        const checkSessionAndSetupListener = async () => {
            
            // 1. VERIFICACIÓN INICIAL CRÍTICA
            const { data: { session }, error } = await supabase.auth.getSession();

            if (!isMounted) return; 

            if (error || !session) {
                // Si NO hay sesión, redirigir
                navigate('/login');
                setIsLoading(false); 
                return;
            }

            // Si SÍ hay sesión, permitir acceso
            setIsLoading(false);

            // 2. Configurar el listener para CAMBIOS FUTUROS
            const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
                if (!newSession && isMounted) {
                    navigate('/login');
                }
            });

            // 3. Función de limpieza
            return () => {
                isMounted = false; 
                authListener.subscription.unsubscribe(); 
            };
        };

        checkSessionAndSetupListener();

        return () => {
            isMounted = false;
        };
    }, [navigate]); 

    // Muestra pantalla de carga mientras verifica
    if (isLoading) {
        return <div className="loading-screen">Verificando acceso...</div>;
    }

    // Si la sesión es válida, renderiza el contenido
    return <>{children}</>;
};

// Exportación por defecto
export default AuthGuard;