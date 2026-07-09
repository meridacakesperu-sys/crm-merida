import React, { useState, useMemo, useEffect } from 'react';
import Header from './Header';
import DashboardView from '../views/DashboardView';
import StudentsView from '../views/StudentsView';
import ReportsView from '../views/ReportsView';
import CalendarView from '../views/CalendarView';
import SettingsView from '../views/SettingsView';
import { mockStudents } from '../data';
import './Dashboard.css';

const Dashboard = ({ currentView }) => {
  const [students, setStudents] = useState([]);
  const [settings, setSettings] = useState({
    wpUrl: 'https://',
    planMensualId: '',
    planAnualId: '',
    precioMensual: 30,
    precioAnual: 160,
    plataformas: ['Yape', 'Plin', 'Transferencia BCP', 'Interbank', 'Western Union', 'Pago Movil', 'Transferencia Mercantil', 'Hotmart', 'Otro'],
    planes: ['Mensual', 'Anual', 'Cuotas'],
    exchangeRate: 3.80
  });

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.PEN) {
          setSettings(prev => ({ ...prev, exchangeRate: data.rates.PEN }));
        }
      })
      .catch(err => console.error('Error fetching exchange rate:', err));

    fetch('https://crm-merida.onrender.com/api/students')
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error('Error fetching students:', err));
  }, []);

  const stats = useMemo(() => {
    const total = students.length;
    const activosMensual = students.filter(s => s.estatus === 'Activo' && s.plan === 'Mensual').length;
    const planesAnuales = students.filter(s => s.plan === 'Anual' || s.plan === 'Cuotas').length;
    
    let ingresos = 0;
    students.forEach(s => {
      if (s.estatus === 'Activo' || s.estatus === 'Completado') {
        if (s.plan === 'Mensual') ingresos += settings.precioMensual;
        if (s.plan === 'Anual') ingresos += settings.precioAnual;
      }
    });

    return { total, activosMensual, planesAnuales, ingresos };
  }, [students, settings]);

  const updateStudentData = async (updatedStudent) => {
    try {
      const response = await fetch(`https://crm-merida.onrender.com/api/students/${updatedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent)
      });
      if(response.ok) {
        const saved = await response.json();
        setStudents(prev => prev.map(s => s.id === saved.id ? saved : s));
      }
    } catch (err) {
      console.error('Error updating student:', err);
    }
  };

  const addStudentData = async (newStudent) => {
    try {
      const response = await fetch('https://crm-merida.onrender.com/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if(response.ok) {
        const savedStudent = await response.json();
        setStudents(prev => [savedStudent, ...prev]);
      }
    } catch (err) {
      console.error('Error adding student:', err);
    }
  };

  const deleteStudentData = async (id) => {
    try {
      await fetch(`https://crm-merida.onrender.com/api/students/${id}`, { method: 'DELETE' });
      setStudents(prev => prev.filter(student => student.id !== id));
    } catch(err) {
      console.error('Error deleting student:', err);
    }
  };

  const deletePaymentData = async (studentId, pagoId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const updatedStudent = {
      ...student,
      historialPagos: student.historialPagos ? student.historialPagos.filter(p => p.id !== pagoId) : []
    };
    await updateStudentData(updatedStudent);
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard':
        return <DashboardView stats={stats} students={students} onUpdateStudent={updateStudentData} onDeleteStudent={deleteStudentData} plataformas={settings.plataformas} planes={settings.planes} exchangeRate={settings.exchangeRate} />;
      case 'users':
        return <StudentsView students={students} onUpdateStudent={updateStudentData} onAddStudent={addStudentData} onDeleteStudent={deleteStudentData} plataformas={settings.plataformas} planes={settings.planes} />;
      case 'analytics':
        return <ReportsView students={students} onDeletePayment={deletePaymentData} />;
      case 'calendar':
        return <CalendarView students={students} onUpdateStudent={updateStudentData} onDeleteStudent={deleteStudentData} plataformas={settings.plataformas} planes={settings.planes} />;
      case 'settings':
        return <SettingsView settings={settings} onUpdateSettings={setSettings} />;
      default:
        return (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <h2>Vista en desarrollo</h2>
              <p>La sección <b>{currentView}</b> estará disponible próximamente.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      {/* Pasamos title dinámico al header */}
      <Header students={students} />
      {renderView()}
    </div>
  );
};

export default Dashboard;
