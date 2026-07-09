import React from 'react';
import { Users, CreditCard, Activity, DollarSign, UserMinus, RefreshCw, Heart, Clock } from 'lucide-react';

const StatCards = ({ stats }) => {
  return (
    <>
    <div className="stat-cards">
      <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="card-icon" style={{ backgroundColor: '#fff3e0', color: '#ff8a65' }}>
          <Users size={24} />
        </div>
        <div className="card-info">
          <h3>{stats?.total || 0}</h3>
          <p>Total Alumnos</p>
        </div>
      </div>
      
      <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="card-icon" style={{ backgroundColor: '#e8f5e9', color: '#43a047' }}>
          <Activity size={24} />
        </div>
        <div className="card-info">
          <h3>{stats?.activosMensual || 0}</h3>
          <p>Activas Mensual</p>
        </div>
      </div>
      
      <div className="card fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="card-icon" style={{ backgroundColor: '#e0f7fa', color: '#00acc1' }}>
          <CreditCard size={24} />
        </div>
        <div className="card-info">
          <h3>{stats?.planesAnuales || 0}</h3>
          <p>Planes Anuales</p>
        </div>
      </div>
      
      <div className="card fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="card-icon" style={{ backgroundColor: '#f3e5f5', color: '#8e24aa' }}>
          <DollarSign size={24} />
        </div>
        <div className="card-info">
          <h3>$ {stats?.ingresos || 0}</h3>
          <p>Ingresos</p>
        </div>
      </div>
    </div>
    <div className="stat-cards" style={{ marginTop: '20px' }}>
      <div className="card fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="card-icon" style={{ backgroundColor: '#ffebee', color: '#e53935' }}>
          <UserMinus size={24} />
        </div>
        <div className="card-info">
          <h3>{stats?.bajasCount || 0}</h3>
          <p>Bajas</p>
        </div>
      </div>
      
      <div className="card fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="card-icon" style={{ backgroundColor: '#e3f2fd', color: '#1e88e5' }}>
          <RefreshCw size={24} />
        </div>
        <div className="card-info">
          <h3>{stats?.recurrence || 0}%</h3>
          <p>Tasa Recurrencia</p>
        </div>
      </div>
      
      <div className="card fade-in custom-tooltip-container" style={{ animationDelay: '0.7s', cursor: 'help' }}>
        <div className="custom-tooltip">
          Se calcula promediando la puntualidad de pagos de los alumnos: Oro (al día) = 100%, Plata (1 atraso) = 50%, Bronce = 0%.
        </div>
        <div className="card-icon" style={{ backgroundColor: '#fce4ec', color: '#d81b60' }}>
          <Heart size={24} />
        </div>
        <div className="card-info">
          <h3>{stats?.puntualidad || 0}%</h3>
          <p>Índice Puntualidad ⓘ</p>
        </div>
      </div>

      <div className="card fade-in custom-tooltip-container" style={{ animationDelay: '0.8s', cursor: 'help' }}>
        <div className="custom-tooltip">
          Mide tu fidelidad promedio: Cuántos meses en promedio se mantiene pagando un alumno en el club (desde su primer pago hasta su último).
        </div>
        <div className="card-icon" style={{ backgroundColor: '#e8eaf6', color: '#3f51b5' }}>
          <Clock size={24} />
        </div>
        <div className="card-info">
          <h3>{stats?.engagement || 0}</h3>
          <p>Meses Engagement ⓘ</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default StatCards;
