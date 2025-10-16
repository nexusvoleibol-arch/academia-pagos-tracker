// src/components/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Asegúrate de que esta ruta sea correcta

export default function LoginPage() {
  const [studentCode, setStudentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentCode) {
        alert("Por favor, ingresa tu código único de estudiante.");
        return;
    }
    
    setIsLoading(true);
    const code = parseInt(studentCode);

    // CONSULTA A SUPABASE (USANDO NOMBRES EN ESPAÑOL)
    const { data, error } = await supabase
        .from('estudiantes') // <--- TABLA: estudiantes
        .select('id') // Solo necesitamos el ID para redirigir
        .eq('codigo_acceso', code) // <--- COLUMNA: codigo_acceso
        .single();
    
    setIsLoading(false);

    if (error || !data) {
        alert("Acceso denegado. Código de estudiante incorrecto o no encontrado.");
        return;
    }

    // Si es exitoso, redirige al dashboard usando el ID
    navigate(`/dashboard/${data.id}`);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '2px 2px 10px rgba(0,0,0,0.1)' }}>
      <h1>App-NexPagos</h1>
      <p>Ingresa tu Código Único de Estudiante</p>
      
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value)}
          placeholder="Ej: 987654"
          disabled={isLoading}
          style={{ width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box' }}
        />
        
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: '10px 20px', width: '100%', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isLoading ? 'Verificando...' : 'Acceder a mis Pagos'}
        </button>
      </form>
    </div>
  );
}