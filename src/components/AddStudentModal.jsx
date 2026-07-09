import React, { useState } from 'react';
import { X, UserPlus, Server } from 'lucide-react';

const AddStudentModal = ({ onClose, onAddStudent, plataformas = [], planes = [] }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    usuario: '',
    password: '',
    numero: '',
    pais: '',
    plan: 'Mensual',
    plataforma: 'Yape',
    otraPlataforma: '',
    cantidadCuotas: 3,
    montoPago: '',
    monedaPago: 'Soles',
    fechaPago: todayStr
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call to WordPress
    setTimeout(() => {
      const finalPlataforma = formData.plataforma === 'Otro' ? formData.otraPlataforma : formData.plataforma;
      
      // Generate a mock fechaPendiente based on today + plan
      const today = new Date();
      let monthsToAdd = 1;
      if (formData.plan === 'Anual') monthsToAdd = 12;
      if (formData.plan === 'Cuotas') monthsToAdd = 3;
      
      today.setMonth(today.getMonth() + monthsToAdd);
      
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yy = String(today.getFullYear()).slice(-2);
      const fechaPendiente = `${dd}/${mm}/${yy}`;

      // Convert YYYY-MM-DD to DD/MM/YYYY for the payment record
      const [pYear, pMonth, pDay] = formData.fechaPago.split('-');
      const formattedFechaPago = `${pDay}/${pMonth}/${pYear}`;

      const initialPayment = {
        id: Date.now() + 1,
        fecha: formattedFechaPago,
        monto: parseFloat(formData.montoPago) || 0,
        moneda: formData.monedaPago,
        plataforma: finalPlataforma,
        mesesAgregados: monthsToAdd
      };

      const newStudent = {
        id: Date.now(), // Mock ID
        ...formData,
        plataforma: finalPlataforma,
        cuotasPendientes: formData.plan === 'Cuotas' ? parseInt(formData.cantidadCuotas) : null,
        fechaInicio: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        fechaPendiente: fechaPendiente,
        estatus: 'Activo',
        pagosAtrasados: 0,
        historialPagos: formData.montoPago ? [initialPayment] : []
      };

      onAddStudent(newStudent);
      setIsSubmitting(false);
    }, 1500); // 1.5 seconds mock delay
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <button className="modal-close" onClick={onClose} disabled={isSubmitting}>
          <X size={24} />
        </button>

        <div className="profile-header" style={{ marginBottom: '20px' }}>
          <div className="profile-title">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserPlus size={24} color="var(--accent-purple)" />
              Nuevo Alumno
            </h2>
            <p>Registrar y crear acceso en WordPress</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div className="detail-group">
            <label className="detail-label">Nombre Completo *</label>
            <input required className="edit-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>

          <div className="detail-group">
            <label className="detail-label">Correo Electrónico (Email) *</label>
            <input required type="email" className="edit-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="detail-group">
              <label className="detail-label">Usuario *</label>
              <input required className="edit-input" value={formData.usuario} onChange={e => setFormData({...formData, usuario: e.target.value})} />
            </div>
            <div className="detail-group">
              <label className="detail-label">Contraseña *</label>
              <input required type="text" className="edit-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="detail-group">
              <label className="detail-label">Teléfono</label>
              <input className="edit-input" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
            </div>
            <div className="detail-group">
              <label className="detail-label">País</label>
              <input className="edit-input" value={formData.pais} onChange={e => setFormData({...formData, pais: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <div className="detail-group">
              <label className="detail-label">Plan de Suscripción</label>
              <select className="edit-input" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                {planes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {formData.plan === 'Cuotas' && (
              <div className="detail-group">
                <label className="detail-label">Cantidad de Cuotas</label>
                <input 
                  type="number" 
                  min="2" 
                  max="12"
                  className="edit-input" 
                  required 
                  value={formData.cantidadCuotas} 
                  onChange={e => setFormData({...formData, cantidadCuotas: e.target.value})} 
                />
              </div>
            )}
            <div className="detail-group">
              <label className="detail-label">Plataforma de Pago</label>
              <select className="edit-input" value={formData.plataforma} onChange={e => setFormData({...formData, plataforma: e.target.value})}>
                {plataformas.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {formData.plataforma === 'Otro' && (
            <div className="detail-group">
              <label className="detail-label">Especificar Medio de Pago</label>
              <input className="edit-input" required value={formData.otraPlataforma} onChange={e => setFormData({...formData, otraPlataforma: e.target.value})} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="detail-group">
              <label className="detail-label">Fecha del Pago *</label>
              <input type="date" required className="edit-input" value={formData.fechaPago} onChange={e => setFormData({...formData, fechaPago: e.target.value})} />
            </div>
            <div className="detail-group">
              <label className="detail-label">Monto Pagado *</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input required type="number" placeholder="Ej. 160" className="edit-input" style={{ flex: 2 }} value={formData.montoPago} onChange={e => setFormData({...formData, montoPago: e.target.value})} />
                <select className="edit-input" style={{ flex: 1, padding: '8px' }} value={formData.monedaPago} onChange={e => setFormData({...formData, monedaPago: e.target.value})}>
                  <option value="Soles">S/</option>
                  <option value="Dólares">$</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
            {isSubmitting && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Server size={14} className="spin-animation" /> Conectando con WordPress...
              </span>
            )}
            <button type="button" className="btn-primary" onClick={onClose} disabled={isSubmitting} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)' }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ backgroundColor: 'var(--accent-purple)', color: 'white', padding: '10px 20px', borderRadius: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Creando Usuario...' : 'Registrar Alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
