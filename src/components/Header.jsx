import React, { useState, useMemo } from 'react';
import { Search, Bell, AlertTriangle, Calendar as CalendarIcon, X } from 'lucide-react';
import './Dashboard.css';

const Header = ({ searchTerm, onSearch, students = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = useMemo(() => {
    if (!students.length) return [];
    const notifs = [];
    const today = new Date();
    
    let atrasadas = 0;
    let hoy = 0;
    let manana = 0;

    const parseDateStr = (dateStr) => {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      return new Date(2000 + parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    };

    students.forEach(student => {
      if (student.estatus === 'Desactivado' || student.estatus === 'De baja') return;
      const dueDate = parseDateStr(student.fechaPendiente);
      if (!dueDate) return;

      const msPerDay = 1000 * 60 * 60 * 24;
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dueTime = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      const diffDays = Math.round((dueTime - todayDate) / msPerDay);

      if (diffDays < 0 || student.pagosAtrasados > 0) {
        notifs.push({ 
          id: `${student.id}-atrasado`, 
          type: 'atrasado', 
          text: `${student.nombre} tiene su pago atrasado.`, 
          icon: <AlertTriangle size={16} color="#d32f2f" /> 
        });
      }
      else if (diffDays === 0) {
        notifs.push({ 
          id: `${student.id}-hoy`, 
          type: 'hoy', 
          text: `A ${student.nombre} le toca pagar hoy.`, 
          icon: <CalendarIcon size={16} color="#16c784" /> 
        });
      }
      else if (diffDays === 1) {
        notifs.push({ 
          id: `${student.id}-manana`, 
          type: 'manana', 
          text: `A ${student.nombre} le toca pagar mañana.`, 
          icon: <CalendarIcon size={16} color="#fb8c00" /> 
        });
      }
    });

    return notifs;
  }, [students]);
  return (
    <div className="header">
      <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src="/logo.png" alt="Club VIP Logo" style={{ height: '45px', width: 'auto', objectFit: 'contain' }} />
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Club VIP CRM</h1>
      </div>
      <div className="header-actions">

        <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} color="#8892b0" />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#d32f2f', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                {notifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div style={{ position: 'absolute', top: '40px', right: '-10px', width: '320px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)', zIndex: 1000, overflow: 'hidden' }} className="fade-in">
              <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fdfdfd' }}>
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Notificaciones</h4>
                <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}><X size={16} color="#8892b0" /></button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No tienes notificaciones pendientes.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '12px', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: n.type === 'atrasado' ? '#ffebee' : n.type === 'hoy' ? '#e8f5e9' : '#fff3e0' }}>
                        {n.icon}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{n.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="user-profile">
          <img src="/avatar.png" alt="Mérida Cakes Avatar" className="avatar" style={{ objectFit: 'cover' }} />
          <div className="user-info">
            <span className="user-name">Mérida Cakes</span>
            <span className="user-role">Administradora</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
