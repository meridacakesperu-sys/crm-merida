import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, MapPin, Key, Edit2, Check, DollarSign, Award, Trash2, UserMinus } from 'lucide-react';
import { getStatusColor, getReputationBadge } from '../data';

const StudentProfileModal = ({ student, onClose, onUpdateStudent, onDeleteStudent, plataformas = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const [formData, setFormData] = useState({ ...student });
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

  const calculateNextDue = (meses) => {
    if (!student.fechaPendiente) return '';
    const parts = student.fechaPendiente.split('/');
    if (parts.length !== 3) return '';
    let d = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    let y = parseInt(parts[2]); // YY format
    m += parseInt(meses || 0);
    while (m > 12) {
      m -= 12;
      y += 1;
    }
    return `20${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  };

  const defaultMeses = student.plan === 'Anual' ? 12 : 1;

  const [paymentData, setPaymentData] = useState({
    plataforma: student.plataforma || 'Yape',
    otraPlataforma: '',
    mesesAAgregar: defaultMeses,
    monto: '',
    moneda: 'Soles',
    fechaPago: todayStr,
    proximaFecha: calculateNextDue(defaultMeses)
  });

  if (!student) return null;

  const handleSave = () => {
    onUpdateStudent(formData);
    setIsEditing(false);
  };

  const handleRegisterPayment = () => {
    // Usar la fecha seleccionada por el usuario (o la calculada por defecto)
    const [nxY, nxM, nxD] = paymentData.proximaFecha.split('-');
    const nuevaFecha = `${nxD}/${nxM}/${nxY.slice(2)}`;
    
    const finalPlataforma = paymentData.plataforma === 'Otro' ? paymentData.otraPlataforma : paymentData.plataforma;

    // Convert paymentData.fechaPago (YYYY-MM-DD) to DD/MM/YYYY
    const [pYear, pMonth, pDay] = paymentData.fechaPago.split('-');
    const fechaPagoFormateada = `${pDay}/${pMonth}/${pYear}`;

    const nuevoPago = {
      id: Date.now(),
      fecha: fechaPagoFormateada,
      monto: paymentData.monto,
      moneda: paymentData.moneda,
      plataforma: finalPlataforma,
      mesesAgregados: paymentData.mesesAAgregar
    };

    const updatedStudent = {
      ...formData,
      fechaPendiente: nuevaFecha,
      plataforma: finalPlataforma,
      estatus: 'Activo', // Reactivar si estaba inactiva
      pagosAtrasados: 0, // Resetear la deuda automáticamente
      cuotasPendientes: formData.plan === 'Cuotas' && formData.cuotasPendientes ? formData.cuotasPendientes - 1 : formData.cuotasPendientes,
      historialPagos: formData.historialPagos ? [...formData.historialPagos, nuevoPago] : [nuevoPago]
    };
    
    setFormData(updatedStudent);
    onUpdateStudent(updatedStudent);
    setShowPaymentForm(false);
    alert(`Pago registrado exitosamente.\nMonto: ${paymentData.monto} ${paymentData.moneda}\nNueva fecha de vencimiento: ${nuevaFecha}`);
  };

  const [isSendingCreds, setIsSendingCreds] = useState(false);
  const handleSendCredentials = async () => {
    if (!student.email) {
      alert('Este alumno no tiene correo registrado.');
      return;
    }
    if (window.confirm(`¿Deseas enviar los datos de acceso al correo ${student.email}?`)) {
      setIsSendingCreds(true);
      try {
        const response = await fetch(`http://localhost:3001/api/students/${student.id}/send-credentials`, {
          method: 'POST'
        });
        const data = await response.json();
        if (response.ok) {
          alert('¡Correo enviado con éxito!');
        } else {
          alert('Error: ' + data.message);
        }
      } catch (err) {
        alert('Error de conexión al enviar correo.');
      } finally {
        setIsSendingCreds(false);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            {formData.nombre.charAt(0)}
          </div>
          <div className="profile-title" style={{ flex: 1 }}>
            {isEditing ? (
              <input 
                className="edit-input" 
                value={formData.nombre} 
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}
              />
            ) : (
              <h2>{formData.nombre}</h2>
            )}
            
            <p>ID Alumno: {formData.id}</p>
            <span style={{ marginTop: '8px', display: 'inline-block' }} className={`status-badge ${getStatusColor(formData.estatus, formData.plan)}`}>
              {formData.estatus} - {formData.plan}
            </span>
          </div>
          {!isEditing && (
            <button className="icon-btn" onClick={() => setIsEditing(true)} title="Editar Datos">
              <Edit2 size={20} color="#8892b0" />
            </button>
          )}
        </div>

        <div className="profile-details">
          <div className="detail-group">
            <span className="detail-label"><DollarSign size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Plan de Suscripción</span>
            {isEditing ? (
              <select className="edit-input" value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})}>
                <option value="Mensual">Mensual</option>
                <option value="Anual">Anual</option>
                <option value="Cuotas">Cuotas</option>
              </select>
            ) : (
              <span className="detail-value">{formData.plan} {formData.plan === 'Cuotas' && formData.cuotasPendientes ? `(${formData.cuotasPendientes} restantes)` : ''}</span>
            )}
          </div>
          
          <div className="detail-group">
            <span className="detail-label"><Mail size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Email</span>
            {isEditing ? (
              <input className="edit-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            ) : (
              <span className="detail-value">{formData.email}</span>
            )}
          </div>

          <div className="detail-group">
            <span className="detail-label"><Mail size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Usuario (WP)</span>
            {isEditing ? (
              <input className="edit-input" placeholder="Nombre de usuario..." value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
            ) : (
              <span className="detail-value">{formData.username || 'No registrado'}</span>
            )}
          </div>
          
          <div className="detail-group">
            <span className="detail-label"><Phone size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Teléfono</span>
            {isEditing ? (
              <input className="edit-input" value={formData.numero || ''} onChange={e => setFormData({...formData, numero: e.target.value})} />
            ) : (
              <span className="detail-value">{formData.numero || 'No registrado'}</span>
            )}
          </div>

          <div className="detail-group">
            <span className="detail-label"><MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> País</span>
            {isEditing ? (
              <input className="edit-input" value={formData.pais || ''} onChange={e => setFormData({...formData, pais: e.target.value})} />
            ) : (
              <span className="detail-value">{formData.pais || 'No registrado'}</span>
            )}
          </div>

          <div className="detail-group">
            <span className="detail-label"><Key size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Contraseña (ARmember)</span>
            {isEditing ? (
              <input className="edit-input" placeholder="Nueva contraseña..." onChange={e => setFormData({...formData, password: e.target.value})} />
            ) : (
              <span className="detail-value" style={{ fontFamily: 'monospace' }}>•••••••• (Oculta)</span>
            )}
          </div>
          
          <div className="detail-group">
            <span className="detail-label"><Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Fecha Inicio</span>
            {isEditing ? (
              <input className="edit-input" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} />
            ) : (
              <span className="detail-value">{formData.fechaInicio}</span>
            )}
          </div>

          <div className="detail-group">
            <span className="detail-label"><Award size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Reputación</span>
            <span className="detail-value" style={{ color: getReputationBadge(formData.pagosAtrasados).color, fontWeight: 'bold' }}>
              {getReputationBadge(formData.pagosAtrasados).icon} Nivel {getReputationBadge(formData.pagosAtrasados).label}
            </span>
          </div>
          
          <div className="detail-group">
            <span className="detail-label"><Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Próximo Pago</span>
            {isEditing ? (
              <input className="edit-input" placeholder="DD/MM/YY" value={formData.fechaPendiente || ''} onChange={e => setFormData({...formData, fechaPendiente: e.target.value})} />
            ) : (
              <span className="detail-value" style={{ color: '#e53935', fontWeight: 'bold' }}>{formData.fechaPendiente}</span>
            )}
          </div>
        </div>

        {showPaymentForm && (
          <div className="payment-form fade-in">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '10px' }}>
              <DollarSign size={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> Registrar Nuevo Pago
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label className="detail-label">Plataforma de Pago</label>
                  <select 
                    className="edit-input" 
                    value={paymentData.plataforma}
                    onChange={e => setPaymentData({...paymentData, plataforma: e.target.value})}
                  >
                    {plataformas.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="detail-label">Meses a extender</label>
                  <select 
                    className="edit-input" 
                    value={paymentData.mesesAAgregar}
                    onChange={e => setPaymentData({...paymentData, mesesAAgregar: e.target.value, proximaFecha: calculateNextDue(e.target.value)})}
                  >
                    <option value="1">1 Mes</option>
                    <option value="2">2 Meses</option>
                    <option value="3">3 Meses</option>
                    <option value="6">6 Meses</option>
                    <option value="12">12 Meses (Anual)</option>
                  </select>
                </div>
              </div>
              
              {paymentData.plataforma === 'Otro' && (
                <div>
                  <label className="detail-label">Especificar Medio de Pago</label>
                  <input 
                    className="edit-input" 
                    placeholder="Escribe el medio de pago..."
                    value={paymentData.otraPlataforma}
                    onChange={e => setPaymentData({...paymentData, otraPlataforma: e.target.value})}
                  />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label className="detail-label">Fecha del Pago Realizado</label>
                  <input 
                    type="date"
                    className="edit-input" 
                    value={paymentData.fechaPago}
                    onChange={e => setPaymentData({...paymentData, fechaPago: e.target.value})}
                  />
                </div>
                <div>
                  <label className="detail-label">Monto Pagado</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input 
                      type="number"
                      className="edit-input" 
                      placeholder="Ej. 160"
                      value={paymentData.monto}
                      onChange={e => setPaymentData({...paymentData, monto: e.target.value})}
                      style={{ flex: 2 }}
                    />
                    <select 
                      className="edit-input" 
                      value={paymentData.moneda}
                      onChange={e => setPaymentData({...paymentData, moneda: e.target.value})}
                      style={{ flex: 1, padding: '8px' }}
                    >
                      <option value="Soles">S/</option>
                      <option value="Dólares">$</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn-primary" onClick={() => setShowPaymentForm(false)} style={{ color: 'var(--text-muted)' }}>Cancelar</button>
              <button className="btn-primary" onClick={handleRegisterPayment} style={{ backgroundColor: '#16c784', color: 'white', padding: '8px 16px', borderRadius: '8px' }}>Confirmar Pago</button>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!showPaymentForm && onDeleteStudent && (
              <button 
                className="btn-primary" 
                onClick={() => {
                  if(window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${formData.nombre} del sistema? Esta acción no se puede deshacer.`)) {
                    onDeleteStudent(formData.id);
                  }
                }}
                style={{ backgroundColor: 'transparent', color: '#d32f2f', padding: '10px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Eliminar Alumno"
              >
                <Trash2 size={18} /> <span style={{ fontSize: '0.9rem' }}>Eliminar</span>
              </button>
            )}

            {!showPaymentForm && formData.estatus !== 'De baja' && (
              <button 
                className="btn-primary" 
                onClick={() => {
                  if(window.confirm(`¿Deseas dar de baja a ${formData.nombre}? Se mantendrá su registro, pero ya no aparecerá en notificaciones ni métricas.`)) {
                    const today = new Date();
                    const fb = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
                    const updated = { ...formData, estatus: 'De baja', fechaBaja: fb };
                    setFormData(updated);
                    onUpdateStudent(updated);
                  }
                }}
                style={{ backgroundColor: 'transparent', color: '#fb8c00', padding: '10px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Dar de Baja"
              >
                <UserMinus size={18} /> <span style={{ fontSize: '0.9rem' }}>Dar de Baja</span>
              </button>
            )}

            {!showPaymentForm && !isEditing && student.email && (
              <button 
                className="btn-primary" 
                onClick={handleSendCredentials}
                disabled={isSendingCreds}
                style={{ backgroundColor: 'transparent', color: '#1e88e5', padding: '10px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Enviar Credenciales por Correo"
              >
                <Mail size={18} /> <span style={{ fontSize: '0.9rem' }}>{isSendingCreds ? 'Enviando...' : 'Enviar Accesos'}</span>
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {isEditing ? (
              <button className="btn-primary" onClick={handleSave} style={{ backgroundColor: '#7b61ff', color: 'white', padding: '10px 20px', borderRadius: '8px' }}>
                <Check size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}/> Guardar Cambios
              </button>
            ) : (
              <>
                {!showPaymentForm && (
                  <button 
                    className="btn-primary" 
                    onClick={() => setShowPaymentForm(true)}
                    style={{ backgroundColor: '#f0f0f5', padding: '10px 20px', borderRadius: '8px' }}
                  >
                    Registrar Pago
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Historial de Pagos Tab */}
        {!isEditing && !showPaymentForm && formData.historialPagos && formData.historialPagos.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: 'var(--text-main)' }}>Historial de Pagos</h3>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f5', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>Fecha</th>
                    <th style={{ padding: '8px' }}>Monto</th>
                    <th style={{ padding: '8px' }}>Plataforma</th>
                  </tr>
                </thead>
                <tbody>
                  {[...formData.historialPagos].reverse().map(pago => (
                    <tr key={pago.id} style={{ borderBottom: '1px solid #f0f0f5' }}>
                      <td style={{ padding: '8px' }}>{pago.fecha}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>
                        {pago.moneda === 'Soles' ? 'S/' : '$'} {pago.monto}
                      </td>
                      <td style={{ padding: '8px' }}>{pago.plataforma}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentProfileModal;
