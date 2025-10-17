// src/components/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
// Importamos los íconos necesarios (FaIdCard en lugar de FaDollarSign)
import { FaUserCircle, FaMoneyBillWave, FaLock, FaCalendarAlt, FaIdCard } from 'react-icons/fa';

// Importa tu imagen de logo. ASUME que está en 'src/assets/nexuslogo.png'
import Logo from '../assets/nexuslogo.png'; 

// Definición de Tipos
interface Student {
  id: number;
  nombre: string; 
  apellido: string;
}
interface Payment {
  mes: string; 
  fecha_pago: string | null; 
  monto_debido: number; 
  estado: string; 
}

// Función para formatear fechas a un formato más amigable
const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// FUNCIÓN MODIFICADA: Quita el prefijo 'US' y solo muestra '$'
const formatCurrency = (amount: number) => {
    // Usa un formato estándar para asegurar el separador de miles y decimales
    // Luego, usa replace() para eliminar el código de país si aparece (US$ -> $ )
    const formatted = amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return formatted.replace('US', '').trim();
}

const getStatusClassName = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PAGADO') return 'status-paid';
    if (s === 'PENDIENTE') return 'status-pending';
    return 'status-default';
};

// ---------------------------------------------------------------------

export default function DashboardPage() {
  const { studentId } = useParams<{ studentId: string }>(); 
  const navigate = useNavigate(); 

  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FUNCIÓN ASÍNCRONA PARA CERRAR SESIÓN
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        navigate('/login');
    } else {
        setError('Error al cerrar sesión.');
    }
  };


  useEffect(() => {
    setLoading(true);
    setError('');

    if (!studentId) {
        setError('Error: ID de estudiante no proporcionado en la URL.');
        setLoading(false);
        return;
    }

    const id = parseInt(studentId);
    if (isNaN(id)) {
        setError('Error: ID de estudiante inválido.');
        setLoading(false);
        return;
    }

    const fetchStudentData = async () => {
        // Obtener datos del estudiante
        const { data: studentData, error: studentError } = await supabase
            .from('estudiantes')
            .select('id, nombre, apellido')
            .eq('id', id)
            .single();
        
        if (studentError || !studentData) {
            setError('Estudiante no encontrado o error de conexión con la base de datos.');
            setLoading(false);
            return;
        }
        setStudent(studentData as Student);

        // Obtener historial de pagos
        const { data: paymentsData, error: paymentsError } = await supabase
            .from('pagos') 
            .select('*')
            .eq('estudiante_id', id) 
            .order('fecha_pago', { ascending: false }); 

        if (paymentsError) {
            setError('Error al cargar historial de pagos.');
        } else {
            setPayments(paymentsData as Payment[]);
        }

        setLoading(false);
    };

    fetchStudentData();

  }, [studentId]); 

  const pendingPayments = payments.filter(p => p.estado.toUpperCase() === 'PENDIENTE');
  const hasPending = pendingPayments.length > 0;
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.monto_debido, 0);
  const formattedTotalPending = formatCurrency(totalPendingAmount);


  if (loading) return <div className="loading-screen">Cargando datos...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!student) return <div className="error-message">No se pudo cargar el perfil.</div>;


  return (
    <div className="dashboard-container-glass">
      <header className="dashboard-header-glass">
          {/* LOGO Y TÍTULO MODIFICADO */}
          <div className="header-branding-glass">
              <img src={Logo} alt="Logo Academia" className="academy-logo-glass" />
              {/* TÍTULO ACTUALIZADO */}
              <h1>MIS PAGOS NEXUS</h1> 
          </div>
        <button 
          onClick={handleLogout} 
          className="logout-button-glass"
        >
          <FaLock style={{ marginRight: '8px' }}/> Cerrar Sesión
        </button>
      </header>
      
      <div className="info-card-glass">
          {/* INFORMACIÓN DEL ESTUDIANTE */}
          <div className="student-details-grid">
            <p>
              <FaUserCircle style={{ marginRight: '10px', color: '#F45D4C' }} /> 
              <span className="info-label-glass">Estudiante:</span>
              <span className="student-detail-glass">{student.nombre} {student.apellido}</span>
            </p>
            <p>
              {/* ÍCONO CAMBIADO: FaIdCard para Código Único */}
              <FaIdCard style={{ marginRight: '10px', color: '#F45D4C' }} /> 
              <span className="info-label-glass">Código Único:</span>
              <span className="student-detail-glass">{student.id}</span>
            </p>
          </div>
      </div>

      {/* PANEL DE SALDO TOTAL */}
      <div className="balance-card-glass">
          <h2 className="total-saldo-title-glass"><FaMoneyBillWave style={{ marginRight: '10px', color: '#F45D4C' }} /> Saldo Total Pendiente</h2>
          {hasPending ? (
              <p className="saldo-amount-glass pending-amount-glass">
                  {/* Usa el nuevo formato $ XX.XX */}
                  {formattedTotalPending} 
              </p>
          ) : (
              <p className="saldo-amount-glass paid-amount-glass">
                  ¡CERO ADEUDO!
              </p>
          )}
      </div>

      <div className="history-section-glass">
        <h2 className="history-title-glass">Historial de Pagos</h2>
        <table className="payments-table-glass">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Fecha de Pago</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((p, index) => ( 
                <tr key={index} className={p.estado.toUpperCase() === 'PENDIENTE' ? 'row-pending' : ''}>
                    <td data-label="Mes"><FaCalendarAlt style={{ marginRight: '8px', color: '#F45D4C' }} /> {p.mes}</td>
                    <td data-label="Fecha de Pago">{formatDate(p.fecha_pago)}</td> 
                    <td data-label="Monto">{formatCurrency(p.monto_debido)}</td>
                    <td data-label="Estado">
                        <span className={getStatusClassName(p.estado)}>
                            {p.estado.toUpperCase()}
                        </span>
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="no-records-glass">No hay registros de pagos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}