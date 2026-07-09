import React, { useMemo, useState } from 'react';
import StatCards from '../components/StatCards';
import { RevenueChart, CustomerChart } from '../components/Charts';
import StudentProfileModal from '../components/StudentProfileModal';
import { Power, MessageCircle, Mail } from 'lucide-react';

const DashboardView = ({ stats, students, onUpdateStudent, onDeleteStudent, exchangeRate = 3.80 }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [timeframe, setTimeframe] = useState('1M');

  const dynamicRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();
    
    if (timeframe === '1W') {
      startDate.setDate(today.getDate() - 7);
    } else if (timeframe === '1M') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (timeframe === '3M') {
      startDate.setMonth(today.getMonth() - 3);
    } else if (timeframe === '6M') {
      startDate.setMonth(today.getMonth() - 6);
    } else if (timeframe === '1Y') {
      startDate.setFullYear(today.getFullYear() - 1);
    }
    startDate.setHours(0, 0, 0, 0);

    let total = 0;
    students.forEach(s => {
      if (s.historialPagos) {
        s.historialPagos.forEach(p => {
          const parts = p.fecha.split('/');
          if (parts.length === 3) {
            const yy = parts[2].length === 4 ? parseInt(parts[2]) : 2000 + parseInt(parts[2]);
            const date = new Date(yy, parseInt(parts[1]) - 1, parts[0]);
            if (date >= startDate && date <= today) {
              const val = p.moneda === 'Soles' ? parseFloat(p.monto) / exchangeRate : parseFloat(p.monto);
              total += val;
            }
          }
        });
      }
    });
    return Math.round(total);
  }, [students, timeframe, exchangeRate]);

  const advancedMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();
    if (timeframe === '1W') startDate.setDate(today.getDate() - 7);
    else if (timeframe === '1M') startDate.setMonth(today.getMonth() - 1);
    else if (timeframe === '3M') startDate.setMonth(today.getMonth() - 3);
    else if (timeframe === '6M') startDate.setMonth(today.getMonth() - 6);
    else if (timeframe === '1Y') startDate.setFullYear(today.getFullYear() - 1);
    startDate.setHours(0, 0, 0, 0);

    let bajasCount = 0;
    let totalScore = 0;
    let scorableStudents = 0;
    let activeWithHistory = 0;
    let totalActive = 0;
    
    let totalRetentionMonths = 0;
    let studentsWithHistoryCount = 0;

    students.forEach(s => {
      // Bajas calculation
      if (s.estatus === 'De baja' && s.fechaBaja) {
        const parts = s.fechaBaja.split('/');
        if (parts.length === 3) {
          const yy = parts[2].length === 4 ? parseInt(parts[2]) : 2000 + parseInt(parts[2]);
          const d = new Date(yy, parseInt(parts[1]) - 1, parts[0]);
          if (d >= startDate && d <= today) {
            bajasCount++;
          }
        }
      }
      
      // Puntualidad & Recurrence
      if (s.estatus === 'Activo' || s.estatus === 'Completado') {
        totalActive++;
        if (s.historialPagos && s.historialPagos.length > 1) {
          activeWithHistory++;
        }
        
        scorableStudents++;
        if (s.pagosAtrasados === 0) totalScore += 100;
        else if (s.pagosAtrasados === 1) totalScore += 50;
      }

      // New Engagement (Retention in Months)
      if (s.historialPagos && s.historialPagos.length > 0) {
        let minDate = null;
        let maxDate = null;
        
        s.historialPagos.forEach(p => {
          const parts = p.fecha.split('/');
          if (parts.length === 3) {
            const yy = parts[2].length === 4 ? parseInt(parts[2]) : 2000 + parseInt(parts[2]);
            const d = new Date(yy, parseInt(parts[1]) - 1, parts[0]);
            if (!minDate || d < minDate) minDate = d;
            if (!maxDate || d > maxDate) maxDate = d;
          }
        });

        if (minDate && maxDate) {
          // If a payment is in the timeframe, consider this student's retention
          if (maxDate >= startDate && maxDate <= today) {
             let monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12;
             monthsDiff -= minDate.getMonth();
             monthsDiff += maxDate.getMonth();
             // Minimum 1 month of retention if they made at least 1 payment
             totalRetentionMonths += (monthsDiff <= 0 ? 1 : monthsDiff + 1);
             studentsWithHistoryCount++;
          }
        }
      }
    });

    const puntualidad = scorableStudents > 0 ? Math.round(totalScore / scorableStudents) : 0;
    const recurrence = totalActive > 0 ? Math.round((activeWithHistory / totalActive) * 100) : 0;
    const engagement = studentsWithHistoryCount > 0 ? (totalRetentionMonths / studentsWithHistoryCount).toFixed(1) : 0;

    return { bajasCount, puntualidad, recurrence, engagement };
  }, [students, timeframe]);

  const { todayStr, tomorrowStr, dueToday, dueTomorrow, pastDue } = useMemo(() => {
    const today = new Date(); // In JS this gets current local date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatShortDate = (date) => {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yy = String(date.getFullYear()).slice(-2);
      return `${dd}/${mm}/${yy}`;
    };

    const todayFormatted = formatShortDate(today);
    const tomorrowFormatted = formatShortDate(tomorrow);

    const parseDateStr = (dateStr) => {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return new Date();
      const yy = parts[2].length === 4 ? parseInt(parts[2]) : 2000 + parseInt(parts[2]);
      return new Date(yy, parseInt(parts[1]) - 1, parseInt(parts[0]));
    };

    const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const isPastDue = (dateStr) => {
      const d = parseDateStr(dateStr);
      return d < todayNoTime;
    };

    const activeStudents = students.filter(s => s.estatus !== 'De baja');

    return {
      todayStr: todayFormatted,
      tomorrowStr: tomorrowFormatted,
      dueToday: activeStudents.filter(s => s.fechaPendiente === todayFormatted),
      dueTomorrow: activeStudents.filter(s => s.fechaPendiente === tomorrowFormatted),
      pastDue: activeStudents.filter(s => isPastDue(s.fechaPendiente))
    };
  }, [students]);

  const handleWhatsAppReminder = (e, student) => {
    e.stopPropagation();
    let amountStr = 'tu cuota';
    if (student.historialPagos && student.historialPagos.length > 0) {
      const lastPayment = student.historialPagos[student.historialPagos.length - 1];
      const currencySymbol = lastPayment.moneda === 'Dólares' ? '$' : 'S/';
      amountStr = `${currencySymbol}${lastPayment.monto}`;
    }
    
    const firstName = student.nombre.split(' ')[0];
    const message = `Hola ${firstName} buenos dias 🤗\n\nPara recordarte que hoy es tu renovación en el Club, son ${amountStr} al 927554437\n\nMe confirmas para registrarlo lo antes posible😉`;
    
    const phone = student.numero ? student.numero.replace(/\D/g, '') : '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEmailReminder = (e, student) => {
    e.stopPropagation();
    let amountStr = 'tu cuota';
    if (student.historialPagos && student.historialPagos.length > 0) {
      const lastPayment = student.historialPagos[student.historialPagos.length - 1];
      const currencySymbol = lastPayment.moneda === 'Dólares' ? '$' : 'S/';
      amountStr = `${currencySymbol}${lastPayment.monto}`;
    }
    
    const firstName = student.nombre.split(' ')[0];
    const subject = `Recordatorio de Renovación - Club VIP CRM`;
    const message = `Hola ${firstName},\n\nEsperamos que estés teniendo un excelente día.\n\nTe escribimos para recordarte que hoy es la fecha de renovación de tu membresía en el Club VIP. El monto de tu cuota es de ${amountStr}.\n\nPuedes realizar el pago y enviarnos tu comprobante a nuestro WhatsApp: 927 554 437 o respondiendo directamente a este correo.\n\n¡Gracias por seguir siendo parte de nuestra comunidad! Quedamos atentos para registrar tu renovación lo antes posible.\n\nSaludos cordiales,\nEquipo Mérida Cakes`;
    
    const url = `https://mail.google.com/mail/u/meridacakesperu@gmail.com/?view=cm&fs=1&to=${student.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="dashboard-content fade-in">
      <StatCards stats={{ ...stats, ingresos: dynamicRevenue, ...advancedMetrics }} />
      
      <div className="dashboard-middle">
        <div className="chart-section">
          <RevenueChart students={students} timeframe={timeframe} onTimeframeChange={setTimeframe} totalRevenue={dynamicRevenue} exchangeRate={exchangeRate} />
        </div>
        <div className="pie-section">
          <CustomerChart students={students} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* Pagos Atrasados */}
        <div className="card fade-in" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h3 style={{ color: '#d32f2f', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
            Pagos Atrasados
          </h3>
          {pastDue.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No hay pagos atrasados.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
              {pastDue.map(s => (
                <li key={s.id} onClick={() => setSelectedStudent(s)} className="dashboard-list-item" style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>{s.nombre}</span>
                    <span style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '0.85rem' }}>{s.fechaPendiente}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="action-btn"
                      style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }}
                      onClick={(e) => handleWhatsAppReminder(e, s)}
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button 
                      className={`action-btn ${s.estatus === 'Activo' || s.estatus === 'Completado' ? 'btn-deactivate' : 'btn-activate'}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const isActivating = s.estatus !== 'Activo' && s.estatus !== 'Completado';
                        if (isActivating && s.pagosAtrasados > 0) {
                          alert('No se puede activar al alumno sin registrar el pago de este mes.');
                          return;
                        }
                        if(onUpdateStudent) onUpdateStudent({...s, estatus: s.estatus === 'Activo' || s.estatus === 'Completado' ? 'Desactivado' : 'Activo'}); 
                      }}
                      title={s.estatus === 'Activo' || s.estatus === 'Completado' ? 'Desactivar' : 'Activar'}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagos de Hoy */}
        <div className="card fade-in" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h3 style={{ color: '#e53935', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
            Vencimientos de Hoy ({todayStr})
          </h3>
          {dueToday.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nadie debe pagar hoy.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {dueToday.map(s => (
                <li key={s.id} onClick={() => setSelectedStudent(s)} className="dashboard-list-item" style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>{s.nombre}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.plan} - {s.plataforma}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="action-btn"
                      style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }}
                      onClick={(e) => handleWhatsAppReminder(e, s)}
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button 
                      className={`action-btn ${s.estatus === 'Activo' || s.estatus === 'Completado' ? 'btn-deactivate' : 'btn-activate'}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const isActivating = s.estatus !== 'Activo' && s.estatus !== 'Completado';
                        if (isActivating && s.pagosAtrasados > 0) {
                          alert('No se puede activar al alumno sin registrar el pago de este mes.');
                          return;
                        }
                        if(onUpdateStudent) onUpdateStudent({...s, estatus: s.estatus === 'Activo' || s.estatus === 'Completado' ? 'Desactivado' : 'Activo'}); 
                      }}
                      title={s.estatus === 'Activo' || s.estatus === 'Completado' ? 'Desactivar' : 'Activar'}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagos de Mañana */}
        <div className="card fade-in" style={{ backgroundColor: 'var(--card-bg)', animationDelay: '0.1s' }}>
          <h3 style={{ color: '#fb8c00', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
            Vencimientos de Mañana ({tomorrowStr})
          </h3>
          {dueTomorrow.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nadie debe pagar mañana.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {dueTomorrow.map(s => (
                <li key={s.id} onClick={() => setSelectedStudent(s)} className="dashboard-list-item" style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>{s.nombre}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.plan} - {s.plataforma}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="action-btn"
                      style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }}
                      onClick={(e) => handleWhatsAppReminder(e, s)}
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button 
                      className="action-btn"
                      style={{ backgroundColor: '#ea4335', color: 'white', border: 'none' }}
                      onClick={(e) => handleEmailReminder(e, s)}
                      title="Enviar recordatorio por Correo"
                    >
                      <Mail size={16} />
                    </button>
                    <button 
                      className={`action-btn ${s.estatus === 'Activo' || s.estatus === 'Completado' ? 'btn-deactivate' : 'btn-activate'}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const isActivating = s.estatus !== 'Activo' && s.estatus !== 'Completado';
                        if (isActivating && s.pagosAtrasados > 0) {
                          alert('No se puede activar al alumno sin registrar el pago de este mes.');
                          return;
                        }
                        if(onUpdateStudent) onUpdateStudent({...s, estatus: s.estatus === 'Activo' || s.estatus === 'Completado' ? 'Desactivado' : 'Activo'}); 
                      }}
                      title={s.estatus === 'Activo' || s.estatus === 'Completado' ? 'Desactivar' : 'Activar'}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)}
          onUpdateStudent={(updated) => {
            if (onUpdateStudent) onUpdateStudent(updated);
            setSelectedStudent(null); // Close modal on update from dashboard for flow
          }}
          onDeleteStudent={(id) => {
            if (onDeleteStudent) onDeleteStudent(id);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default DashboardView;
