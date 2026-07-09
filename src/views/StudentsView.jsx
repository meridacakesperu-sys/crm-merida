import React, { useState, useMemo } from 'react';
import StudentsTable from '../components/StudentsTable';
import StudentProfileModal from '../components/StudentProfileModal';
import AddStudentModal from '../components/AddStudentModal';
import { UserPlus } from 'lucide-react';

const StudentsView = ({ students, onUpdateStudent, onAddStudent, onDeleteStudent, plataformas = [], planes = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('Todos');
  const [filterMetodo, setFilterMetodo] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterReputacion, setFilterReputacion] = useState('Todos');
  const [filterFecha, setFilterFecha] = useState('');
  const [filterPais, setFilterPais] = useState('Todos');
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchSearch = student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPlan = filterPlan === 'Todos' || student.plan === filterPlan;
      const matchMetodo = filterMetodo === 'Todos' || student.plataforma === filterMetodo;
      const matchEstado = filterEstado === 'Todos' || student.estatus === filterEstado;
      const matchPais = filterPais === 'Todos' || student.pais === filterPais;
      
      let matchReputacion = true;
      if (filterReputacion !== 'Todos') {
        const p = student.pagosAtrasados || 0;
        if (filterReputacion === 'Oro') matchReputacion = p === 0;
        if (filterReputacion === 'Plata') matchReputacion = p === 1 || p === 2;
        if (filterReputacion === 'Bronce') matchReputacion = p >= 3;
      }

      let matchFecha = true;
      if (filterFecha) {
        // filterFecha is YYYY-MM-DD from the input
        const parts = filterFecha.split('-');
        if (parts.length === 3) {
          const dd = parts[2];
          const mm = parts[1];
          const yy = parts[0].slice(-2);
          const formattedFecha = `${dd}/${mm}/${yy}`;
          matchFecha = student.fechaPendiente === formattedFecha;
        }
      }
      
      return matchSearch && matchPlan && matchMetodo && matchEstado && matchReputacion && matchFecha && matchPais;
    });
  }, [students, searchTerm, filterPlan, filterMetodo, filterEstado, filterReputacion, filterFecha, filterPais]);

  const uniquePaises = useMemo(() => {
    const paises = new Set(students.map(s => s.pais).filter(Boolean));
    return Array.from(paises).sort();
  }, [students]);

  const toggleStudentStatus = (id) => {
    const student = students.find(s => s.id === id);
    if(student) {
      const isActivating = student.estatus !== 'Activo' && student.estatus !== 'Completado';
      
      if (isActivating && student.pagosAtrasados > 0) {
        alert('No se puede activar al alumno sin registrar el pago de este mes.');
        return;
      }
      
      const newStatus = student.estatus === 'Activo' || student.estatus === 'Completado' ? 'Desactivado' : 'Activo';
      onUpdateStudent({ ...student, estatus: newStatus });
    }
  };

  return (
    <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Gestión de Alumnos</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: 'var(--accent-purple)', color: 'white', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={18} /> Nuevo Alumno
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px', backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre o email..." 
          className="edit-input" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select className="edit-input" value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
          <option value="Todos">Planes: Todos</option>
          <option value="Mensual">Mensual</option>
          <option value="Anual">Anual</option>
          <option value="Cuotas">Cuotas</option>
        </select>
        <select className="edit-input" value={filterMetodo} onChange={e => setFilterMetodo(e.target.value)}>
          <option value="Todos">Método: Todos</option>
          {plataformas.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="edit-input" value={filterPais} onChange={e => setFilterPais(e.target.value)}>
          <option value="Todos">País: Todos</option>
          {uniquePaises.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="edit-input" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="Todos">Estado: Todos</option>
          <option value="Activo">Activo</option>
          <option value="De baja">De baja</option>
          <option value="Completado">Completado</option>
          <option value="Desactivado">Desactivado</option>
        </select>
        <select className="edit-input" value={filterReputacion} onChange={e => setFilterReputacion(e.target.value)}>
          <option value="Todos">Reputación: Todas</option>
          <option value="Oro">🥇 Oro</option>
          <option value="Plata">🥈 Plata</option>
          <option value="Bronce">🥉 Bronce</option>
        </select>
        <input 
          type="date" 
          className="edit-input" 
          title="Filtrar por Fecha de Pago Exacta"
          value={filterFecha}
          onChange={e => setFilterFecha(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="dashboard-bottom" style={{ flex: 1 }}>
        <StudentsTable 
          students={filteredStudents} 
          searchTerm={''} // Ya filtramos aquí
          onToggleStatus={toggleStudentStatus} 
          onSelectStudent={setSelectedStudent}
        />
      </div>

      {selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent} 
          plataformas={plataformas}
          onClose={() => setSelectedStudent(null)}
          onUpdateStudent={(updated) => {
            onUpdateStudent(updated);
            setSelectedStudent(updated);
          }}
          onDeleteStudent={(id) => {
            if (onDeleteStudent) onDeleteStudent(id);
            setSelectedStudent(null);
          }}
        />
      )}

      {showAddModal && (
        <AddStudentModal 
          plataformas={plataformas}
          planes={planes}
          onClose={() => setShowAddModal(false)}
          onAddStudent={(newStudent) => {
            if (onAddStudent) onAddStudent(newStudent);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default StudentsView;
