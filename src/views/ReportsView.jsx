import React, { useState, useMemo } from 'react';
import { Trash2, Search, Calendar, TrendingUp } from 'lucide-react';

const ReportsView = ({ students, onDeletePayment }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}`;
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all payments from all students
  const allPayments = useMemo(() => {
    let payments = [];
    students.forEach(student => {
      if (student.historialPagos && student.historialPagos.length > 0) {
        student.historialPagos.forEach(pago => {
          payments.push({
            ...pago,
            studentName: student.nombre,
            studentId: student.id,
            plan: student.plan
          });
        });
      }
    });
    // Sort by date (descending, assuming dd/mm/yyyy for now, we'll do simple sort)
    return payments.reverse();
  }, [students]);

  // Filter payments by selected month (Format YYYY-MM)
  const [yearStr, monthStr] = selectedMonth.split('-');
  
  const monthlyPayments = useMemo(() => {
    return allPayments.filter(pago => {
      // pago.fecha is like "27/04/2025"
      const parts = pago.fecha.split('/');
      if (parts.length === 3) {
        const matchMonth = parts[1] === monthStr && parts[2] === yearStr;
        const matchSearch = pago.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            pago.plataforma.toLowerCase().includes(searchTerm.toLowerCase());
        return matchMonth && matchSearch;
      }
      return false;
    });
  }, [allPayments, monthStr, yearStr, searchTerm]);

  const totalSoles = monthlyPayments.filter(p => p.moneda === 'Soles').reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);
  const totalDolares = monthlyPayments.filter(p => p.moneda === 'Dólares').reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);

  const today = new Date();
  const todayFormatted = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  
  const dailyPayments = monthlyPayments.filter(p => p.fecha === todayFormatted);
  const dailySoles = dailyPayments.filter(p => p.moneda === 'Soles').reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);
  const dailyDolares = dailyPayments.filter(p => p.moneda === 'Dólares').reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);

  return (
    <div className="dashboard-content">
      <div className="table-container fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="table-header" style={{ marginBottom: '30px' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={22} color="var(--accent-green)"/> Ventas</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>Ingresos generados en el mes seleccionado</p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#8892b0" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input 
                type="text" 
                className="edit-input" 
                placeholder="Buscar alumno o método..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '35px', width: '250px' }}
              />
            </div>
            <input 
              type="month" 
              className="edit-input" 
              style={{ width: '180px' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
          <div className="card" style={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #43a047' }}>
            <div className="card-info">
              <h3 style={{ color: '#43a047', fontSize: '1.2rem' }}>S/ {totalSoles.toFixed(2)}</h3>
              <p style={{ fontSize: '0.8rem' }}>Mensual (Soles)</p>
            </div>
          </div>
          <div className="card" style={{ backgroundColor: '#e0f7fa', borderLeft: '4px solid #00acc1' }}>
            <div className="card-info">
              <h3 style={{ color: '#00acc1', fontSize: '1.2rem' }}>$ {totalDolares.toFixed(2)}</h3>
              <p style={{ fontSize: '0.8rem' }}>Mensual (Dólares)</p>
            </div>
          </div>
          
          {/* Daily Sales */}
          <div className="card" style={{ backgroundColor: '#fcfaf5', borderLeft: '4px solid #f9a826' }}>
            <div className="card-info">
              <h3 style={{ color: '#f9a826', fontSize: '1.2rem' }}>S/ {dailySoles.toFixed(2)}</h3>
              <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12}/> Hoy (Soles)</p>
            </div>
          </div>
          <div className="card" style={{ backgroundColor: '#f5f5fc', borderLeft: '4px solid var(--accent-purple)' }}>
            <div className="card-info">
              <h3 style={{ color: 'var(--accent-purple)', fontSize: '1.2rem' }}>$ {dailyDolares.toFixed(2)}</h3>
              <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12}/> Hoy (Dólares)</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="students-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Alumno</th>
                <th>Plan</th>
                <th>Plataforma</th>
                <th>Meses Pagados</th>
                <th>Monto</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {monthlyPayments.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#8892b0' }}>
                    No hay pagos registrados en este mes.
                  </td>
                </tr>
              )}
              {monthlyPayments.map((pago, index) => (
                <tr key={index}>
                  <td><span style={{ fontWeight: 500 }}>{pago.fecha}</span></td>
                  <td>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{pago.studentName}</span>
                  </td>
                  <td><span style={{ fontSize: '0.85rem' }}>{pago.plan}</span></td>
                  <td><span className="status-badge status-gray">{pago.plataforma}</span></td>
                  <td>{pago.mesesAgregados} mes(es)</td>
                  <td>
                    <span style={{ fontWeight: 'bold', color: pago.moneda === 'Soles' ? '#43a047' : '#00acc1' }}>
                      {pago.moneda === 'Soles' ? 'S/' : '$'} {pago.monto}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="icon-btn" 
                      onClick={() => {
                        if(window.confirm(`¿Seguro que deseas anular el pago de ${pago.studentName} por ${pago.moneda === 'Soles' ? 'S/' : '$'}${pago.monto}?`)) {
                          if (onDeletePayment) onDeletePayment(pago.studentId, pago.id);
                        }
                      }}
                      title="Anular Pago"
                    >
                      <Trash2 size={16} color="#d32f2f" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
