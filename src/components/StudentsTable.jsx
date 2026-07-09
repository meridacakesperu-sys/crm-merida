import React, { useMemo } from 'react';
import { getStatusColor, getReputationBadge } from '../data';
import { MoreVertical, Power, MessageCircle, Mail } from 'lucide-react';

const StudentsTable = ({ students, searchTerm, onToggleStatus, onSelectStudent }) => {
  
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

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
    <div className="table-container fade-in" style={{ animationDelay: '0.7s' }}>
      <div className="table-header">
        <h3>Registro de Alumnos ({filteredStudents.length})</h3>
        <button className="btn-primary" onClick={() => alert("Función para ver historial completo en desarrollo")}>Ver todas</button>
      </div>
      <div className="table-responsive">
        <table className="students-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Plan</th>
              <th>Plataforma</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Acción WP</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#8892b0' }}>
                  No se encontraron alumnos con "{searchTerm}"
                </td>
              </tr>
            )}
            {filteredStudents.map((student) => (
              <tr key={student.id} onClick={() => onSelectStudent(student)}>
                <td>
                  <div className="student-name-cell">
                    <div className="student-avatar">{student.nombre.charAt(0)}</div>
                    <div>
                      <p className="student-name">
                        {student.nombre}
                        <span title={getReputationBadge(student.pagosAtrasados).desc} style={{ marginLeft: '6px', cursor: 'help' }}>
                          {getReputationBadge(student.pagosAtrasados).icon}
                        </span>
                      </p>
                      <p className="student-email">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{student.plan}</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: '#8892b0' }}>{student.plataforma}</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: '#1f1b40', fontWeight: 600 }}>{student.fechaPendiente}</span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(student.estatus, student.plan)}`}>
                    {student.estatus}
                  </span>
                </td>
                <td>
                  <button 
                    className="action-btn"
                    style={{ backgroundColor: '#25D366', color: 'white', border: 'none', marginRight: '8px' }}
                    onClick={(e) => handleWhatsAppReminder(e, student)}
                    title="Enviar recordatorio por WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button 
                    className="action-btn"
                    style={{ backgroundColor: '#ea4335', color: 'white', border: 'none', marginRight: '8px' }}
                    onClick={(e) => handleEmailReminder(e, student)}
                    title="Enviar recordatorio por Correo"
                  >
                    <Mail size={16} />
                  </button>
                  <button 
                    className={`action-btn ${student.estatus === 'Activo' || student.estatus === 'Completado' ? 'btn-deactivate' : 'btn-activate'}`}
                    onClick={(e) => { e.stopPropagation(); onToggleStatus(student.id); }}
                    title={student.estatus === 'Activo' || student.estatus === 'Completado' ? 'Desactivar en WordPress' : 'Activar en WordPress'}
                  >
                    <Power size={16} />
                  </button>
                  <button className="icon-btn" style={{ marginLeft: '8px' }} onClick={(e) => { e.stopPropagation(); alert(`Opciones para ${student.nombre}`); }}>
                    <MoreVertical size={16} color="#8892b0" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;
