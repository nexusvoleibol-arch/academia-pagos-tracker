// src/components/LoginPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Importar recursos para el diseño Glassmorphism
import Logo from '../assets/nexuslogo.png'; 
import CanchaFondo from '../assets/ilustracion.jpg'; 

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Validación de código
    if (!accessCode) {
      setError('Por favor, ingresa tu código de estudiante.');
      setLoading(false);
      return;
    }

    // Convertimos el código a número para la búsqueda (asumiendo que es INT en DB)
    const id = parseInt(accessCode);
    if (isNaN(id)) {
      setError('Código inválido. Debe ser un número.');
      setLoading(false);
      return;
    }

    // 2. Consulta a Supabase (CORRECCIÓN CLAVE: Buscar por 'codigo_acceso')
    const { data, error: fetchError } = await supabase
      .from('estudiantes')
      .select('id') // Solo necesitamos el ID para la redirección
      .eq('codigo_acceso', id) // <--- ¡CAMBIO AQUÍ!
      .single(); 

    // 3. Manejo de errores y redirección
    if (fetchError || !data) {
      console.error("Error al buscar estudiante:", fetchError);
      setError('Código de estudiante incorrecto o no encontrado.');
      setLoading(false);
    } else {
      // Si la búsqueda fue exitosa, redirigimos al dashboard con el ID de la fila (data.id)
      setLoading(false);
      navigate(`/dashboard/${data.id}`);
    }
  };

  return (
    <div className="login-page-container">
      
      {/* SECCIÓN IZQUIERDA: FONDO Y TEXTO */}
      <div className="login-illustration-section">
        <img src={CanchaFondo} alt="Cancha de Voleibol" className="cancha-background-image" />
        
        <div className="illustration-content">
          <img 
            src={Logo} 
            alt="Logo de la Academia" 
            className="login-academy-logo-glass"
          />
          <h1 className="welcome-title">BIENVENIDOS</h1>
          <p className="welcome-subtitle">Nexus App - Constancia & Disciplina</p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO GLASSMORFICO */}
      <div className="login-form-section">
        <h2 className="login-title">Acceso de Estudiantes</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="accessCode" className="input-label">Código de Estudiante</label>
            <input
              type="text"
              id="accessCode"
              className="login-input-glass"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              disabled={loading}
              placeholder="Ej: 12345"
            />
          </div>
          {error && <p className="login-error-message">{error}</p>}
          <button 
            type="submit" 
            className="login-button-glass"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}