import React from 'react';
import { LayoutDashboard, Users, BarChart3, Calendar, MessageSquare, Settings, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ currentView, setCurrentView, onLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/avatar.png" alt="Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
      </div>
      <nav className="sidebar-nav">
        <a href="#" className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }} title="Dashboard principal">
          <LayoutDashboard size={20} />
        </a>
        <a href="#" className={`nav-item ${currentView === 'users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('users'); }} title="Gestión de Alumnos">
          <Users size={20} />
        </a>
        <a href="#" className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('analytics'); }} title="Ventas">
          <BarChart3 size={20} />
        </a>
        <a href="#" className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('calendar'); }} title="Calendario de Vencimientos">
          <Calendar size={20} />
        </a>
      </nav>
      <div className="sidebar-bottom">
        <a href="#" className={`nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('settings'); }} title="Configuración de ARmember">
          <Settings size={20} />
        </a>
        <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); onLogout && onLogout(); }} title="Cerrar Sesión" style={{marginTop: '20px', color: '#ff4b4b'}}>
          <LogOut size={20} />
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
