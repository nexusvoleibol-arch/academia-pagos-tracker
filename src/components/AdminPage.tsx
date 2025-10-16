// src/components/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Asegúrate de que esta ruta sea correcta

// NOTA: Usa una contraseña segura. ESTO ES SOLO PARA PRUEBA.
const ADMIN_PASSWORD = "TuPasswordSegura"; 

interface Student {
  id: number;
  name: string;
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ----------------------
// COMPONENTE DE LOGIN ADMIN
// ----------------------
function AdminLogin({ onLogin }: { onLogin: () => void }) {
    const [password, setPassword] = useState('');
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            onLogin();
        } else {
            alert("Contraseña incorrecta.");
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '300px', margin: '100px auto', border: '1px solid #1a73e8', borderRadius: '8px', textAlign: 'center' }}>
            <h2>Acceso Administrador</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '10px', border: '1px solid #ccc' }}
                />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#1a73e8', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Ingresar
                </button>
            </form>
        </div>
    );
}

// ----------------------
// COMPONENTE DE PANEL PRINCIPAL
// ----------------------
function AdminPanel() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
    const [monthToUpdate, setMonthToUpdate] = useState('');
    const [monthToGenerate, setMonthToGenerate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Cargar la lista de estudiantes
    useEffect(() => {
        async function fetchStudents() {
            const { data } = await supabase
                .from('estudiantes') // <--- TABLA: estudiantes
                .select('id, nombre, apellido') // <--- COLUMNAS: nombre, apellido
                .order('nombre', { ascending: true });
            
            if (data) {
                // Combina nombre y apellido
                setStudents(data.map(s => ({ id: s.id, name: `${s.nombre} ${s.apellido}` })) as Student[]);
            }
        }
        fetchStudents();
    }, []);

    // ------------------------------------------
    // LÓGICA 1: REGISTRAR PAGO INDIVIDUAL (UPDATE)
    // ------------------------------------------
    const handlePaymentUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (!selectedStudent || !monthToUpdate) {
            setMessage('Selecciona un estudiante y un mes.');
            return;
        }

        setIsLoading(true);

        const { error } = await supabase
            .from('pagos') // <--- TABLA: pagos
            .update({ 
                estado: 'PAGADO', // <--- COLUMNA: estado
                fecha_pago: new Date().toISOString().split('T')[0] // <--- COLUMNA: fecha_pago
            })
            .eq('estudiante_id', selectedStudent) // <--- COLUMNA: estudiante_id
            .eq('mes', monthToUpdate); // <--- COLUMNA: mes

        setIsLoading(false);

        if (error) {
            console.error(error);
            setMessage('❌ Error al registrar pago. Revisa si el registro PENDIENTE existe para ese mes.');
        } else {
            setMessage(`✅ Pago de ${monthToUpdate} registrado para el estudiante ${students.find(s => s.id === selectedStudent)?.name}.`);
            setSelectedStudent(null);
            setMonthToUpdate('');
        }
    };

    // ------------------------------------------
    // LÓGICA 2: GENERAR PAGOS PENDIENTES (INSERT MASIVO)
    // ------------------------------------------
    const handleMonthGeneration = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (!monthToGenerate) {
            setMessage('Selecciona un mes para generar.');
            return;
        }

        const amount = 50.00; // MONTO BASE DE LA MENSUALIDAD

        if (!confirm(`¿Seguro que deseas generar el mes de ${monthToGenerate} (PENDIENTE) para los ${students.length} estudiantes?`)) {
            return;
        }

        setIsLoading(true);

        // Crear la lista de nuevos registros PENDIENTES
        const newPayments = students.map(student => ({
            estudiante_id: student.id, // <--- COLUMNA: estudiante_id
            mes: monthToGenerate, // <--- COLUMNA: mes
            monto_debido: amount, // <--- COLUMNA: monto_debido
            estado: 'PENDIENTE', // <--- COLUMNA: estado
            fecha_limite: new Date().toISOString().split('T')[0] // <--- COLUMNA: fecha_limite
        }));

        // Insertar todos los registros
        const { error } = await supabase
            .from('pagos') // <--- TABLA: pagos
            .insert(newPayments);

        setIsLoading(false);

        if (error) {
            console.error(error);
            setMessage('❌ Error al generar pagos. El mes podría haber sido generado previamente (restricción de clave).');
        } else {
            setMessage(`🎉 Pagos de ${monthToGenerate} Generados! ${students.length} registros PENDIENTES creados.`);
            setMonthToGenerate('');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '30px auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: '#1a73e8', borderBottom: '2px solid #1a73e8', paddingBottom: '10px' }}>Panel de Administración</h1>

            <p style={{ color: message.startsWith('✅') ? 'green' : message.startsWith('❌') ? 'red' : 'blue', fontWeight: 'bold' }}>{message}</p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                
                {/* Formulario 1: Registrar Pago Individual (UPDATE) */}
                <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff' }}>
                    <h2 style={{ fontSize: '1.2em', marginBottom: '15px' }}>1. Registrar Pago Individual</h2>
                    <form onSubmit={handlePaymentUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        
                        <select 
                            value={selectedStudent || ''}
                            onChange={(e) => setSelectedStudent(parseInt(e.target.value))}
                            style={{ padding: '8px' }}
                        >
                            <option value="" disabled>Selecciona Estudiante</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name} (ID: {student.id})
                                </option>
                            ))}
                        </select>

                        <select 
                            value={monthToUpdate}
                            onChange={(e) => setMonthToUpdate(e.target.value)}
                            style={{ padding: '8px' }}
                        >
                            <option value="" disabled>Selecciona Mes Pagado</option>
                            {MONTHS.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Pago (UPDATE)'}
                        </button>
                    </form>
                </div>

                {/* Formulario 2: Generar Pagos Masivos (INSERT) */}
                <div style={{ flex: 1, padding: '20px', border: '1px solid #f90', borderRadius: '5px', backgroundColor: '#fff3e0' }}>
                    <h2 style={{ fontSize: '1.2em', marginBottom: '15px', color: '#f90' }}>2. Generar Mensualidad Masiva</h2>
                    <form onSubmit={handleMonthGeneration} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        
                        <select 
                            value={monthToGenerate}
                            onChange={(e) => setMonthToGenerate(e.target.value)}
                            style={{ padding: '8px' }}
                        >
                            <option value="" disabled>Selecciona Mes a Generar</option>
                            {MONTHS.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.9em', color: '#333' }}>Esto crea registros **PENDIENTES** para todos los estudiantes.</p>

                        <button 
                            type="submit" 
                            disabled={isLoading || students.length === 0}
                            style={{ padding: '10px', backgroundColor: '#ff9800', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                            {isLoading ? 'Generando...' : `Generar Pagos PENDIENTES para ${students.length} Estudiantes`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ----------------------
// COMPONENTE PRINCIPAL (Router)
// ----------------------
export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    if (!isLoggedIn) {
        // Muestra el formulario de login si no está logeado
        return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
    }

    // Muestra el panel si el login es exitoso
    return <AdminPanel />;
}