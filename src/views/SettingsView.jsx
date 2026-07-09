import React, { useState } from 'react';
import { Settings, Link as LinkIcon, DollarSign, CreditCard, Plus, X, Save } from 'lucide-react';

const SettingsView = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState({ ...settings });
  const [newPlatform, setNewPlatform] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPwdMessage({ text: 'Por favor, llena ambos campos.', type: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('crm_token');
      const res = await fetch('https://crm-merida.onrender.com/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMessage({ text: 'Contraseña actualizada con éxito.', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPwdMessage({ text: data.error || 'Error al cambiar contraseña.', type: 'error' });
      }
    } catch (err) {
      setPwdMessage({ text: 'Error de conexión con el servidor.', type: 'error' });
    }
    setTimeout(() => setPwdMessage({ text: '', type: '' }), 4000);
  };

  const handleSave = () => {
    onUpdateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const addPlatform = () => {
    if (newPlatform.trim() && !formData.plataformas.includes(newPlatform.trim())) {
      setFormData({
        ...formData,
        plataformas: [...formData.plataformas, newPlatform.trim()]
      });
      setNewPlatform('');
    }
  };

  const removePlatform = (platform) => {
    setFormData({
      ...formData,
      plataformas: formData.plataformas.filter(p => p !== platform)
    });
  };

  const addPlan = () => {
    if (newPlan.trim() && !formData.planes.includes(newPlan.trim())) {
      setFormData({
        ...formData,
        planes: [...formData.planes, newPlan.trim()]
      });
      setNewPlan('');
    }
  };

  const removePlan = (plan) => {
    setFormData({
      ...formData,
      planes: formData.planes.filter(p => p !== plan)
    });
  };

  return (
    <div className="dashboard-content fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={28} color="var(--accent-blue)" />
          Configuración del Sistema
        </h2>
        <button 
          className="btn-primary" 
          onClick={handleSave} 
          style={{ backgroundColor: isSaved ? '#16c784' : 'var(--accent-purple)', color: 'white', padding: '10px 20px', borderRadius: '8px', transition: 'all 0.3s' }}
        >
          <Save size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          {isSaved ? 'Guardado con éxito' : 'Guardar Cambios'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        
        {/* Security & Password */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <Settings size={20} color="#d81b60" /> Seguridad de la Cuenta
          </h3>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0' }}>
            Cambia tu contraseña maestra para acceder al CRM.
          </p>

          <div className="detail-group">
            <label className="detail-label">Contraseña Actual</label>
            <input 
              type="password" 
              className="edit-input" 
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="detail-group">
            <label className="detail-label">Nueva Contraseña</label>
            <input 
              type="password" 
              className="edit-input" 
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {pwdMessage.text && (
            <div style={{ 
              padding: '10px', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              backgroundColor: pwdMessage.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: pwdMessage.type === 'success' ? '#2e7d32' : '#c62828'
            }}>
              {pwdMessage.text}
            </div>
          )}

          <button 
            className="btn-primary" 
            onClick={handleChangePassword}
            style={{ backgroundColor: '#d81b60', color: 'white', padding: '10px', borderRadius: '8px', alignSelf: 'flex-start' }}
          >
            Actualizar Contraseña
          </button>
        </div>

        {/* WordPress Integration */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <LinkIcon size={20} color="var(--accent-purple)" /> Integración WordPress
          </h3>
          
          <div className="detail-group">
            <label className="detail-label">URL del Sitio Web</label>
            <input 
              type="text" 
              className="edit-input" 
              placeholder="https://misitio.com"
              value={formData.wpUrl}
              onChange={(e) => setFormData({...formData, wpUrl: e.target.value})}
            />
            <small style={{ color: 'var(--text-muted)', marginTop: '5px', display: 'block' }}>Base para la conexión de la API REST.</small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="detail-group">
              <label className="detail-label">ID Plan Mensual (ARmember)</label>
              <input 
                type="text" 
                className="edit-input" 
                placeholder="Ej. plan_1"
                value={formData.planMensualId}
                onChange={(e) => setFormData({...formData, planMensualId: e.target.value})}
              />
            </div>
            <div className="detail-group">
              <label className="detail-label">ID Plan Anual (ARmember)</label>
              <input 
                type="text" 
                className="edit-input" 
                placeholder="Ej. plan_2"
                value={formData.planAnualId}
                onChange={(e) => setFormData({...formData, planAnualId: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Reports */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <DollarSign size={20} color="#16c784" /> Precios y Reportes
          </h3>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0' }}>
            Estos valores se utilizan para calcular automáticamente los ingresos estimados en el Dashboard principal.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="detail-group">
              <label className="detail-label">Precio Plan Mensual</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>$</span>
                <input 
                  type="number" 
                  className="edit-input" 
                  value={formData.precioMensual}
                  onChange={(e) => setFormData({...formData, precioMensual: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="detail-group">
              <label className="detail-label">Precio Plan Anual</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>$</span>
                <input 
                  type="number" 
                  className="edit-input" 
                  value={formData.precioAnual}
                  onChange={(e) => setFormData({...formData, precioAnual: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Platforms */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <CreditCard size={20} color="#ff8a65" /> Plataformas de Pago Habilitadas
          </h3>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Administra los métodos de pago que aparecerán como opciones al registrar a un alumno o al renovar su suscripción.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            {formData.plataformas.map((platform) => (
              <div key={platform} style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                backgroundColor: '#f0f0f5', padding: '8px 15px', 
                borderRadius: '20px', fontSize: '0.9rem', color: 'var(--text-main)',
                border: '1px solid #e0e0e0'
              }}>
                {platform}
                <button 
                  onClick={() => removePlatform(platform)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Eliminar plataforma"
                >
                  <X size={14} color="#d32f2f" />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
            <input 
              type="text" 
              className="edit-input" 
              placeholder="Ej. PayPal, Zelle, Binance..."
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlatform()}
            />
            <button 
              className="btn-primary" 
              onClick={addPlatform}
              style={{ padding: '0 20px', borderRadius: '8px', backgroundColor: '#f0f0f5', color: 'var(--text-main)' }}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Custom Plans */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <CreditCard size={20} color="var(--accent-purple)" /> Planes de Suscripción Especiales
          </h3>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Administra los planes que ofrecerás a tus alumnos. Los planes base son Mensual, Anual y Cuotas, pero puedes crear nombres personalizados como "Beca", "Vitalicio", etc.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            {formData.planes.map((plan) => (
              <div key={plan} style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                backgroundColor: '#f0f0f5', padding: '8px 15px', 
                borderRadius: '20px', fontSize: '0.9rem', color: 'var(--text-main)',
                border: '1px solid #e0e0e0'
              }}>
                {plan}
                <button 
                  onClick={() => removePlan(plan)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Eliminar plan"
                >
                  <X size={14} color="#d32f2f" />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
            <input 
              type="text" 
              className="edit-input" 
              placeholder="Ej. Plan Beca, Promoción Verano..."
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlan()}
            />
            <button 
              className="btn-primary" 
              onClick={addPlan}
              style={{ padding: '0 20px', borderRadius: '8px', backgroundColor: '#f0f0f5', color: 'var(--text-main)' }}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
