import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Power } from 'lucide-react';
import StudentProfileModal from '../components/StudentProfileModal';

const CalendarView = ({ students, onUpdateStudent, onDeleteStudent, plataformas = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStudent, setSelectedStudent] = useState(null);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const today = () => setCurrentDate(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 is Sunday, 1 is Monday

  // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const parseDateStr = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(2000 + parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  const studentsByDate = useMemo(() => {
    const map = {};
    students.forEach(student => {
      if (student.estatus === 'De baja') return; // Skip De baja
      const d = parseDateStr(student.fechaPendiente);
      if (d) {
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push(student);
      }
    });
    return map;
  }, [students]);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Current day string for highlighting today
  const actualToday = new Date();
  const isCurrentMonth = actualToday.getMonth() === currentDate.getMonth() && actualToday.getFullYear() === currentDate.getFullYear();
  const currentDayNum = actualToday.getDate();

  return (
    <div className="dashboard-content fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarIcon size={24} color="var(--accent-purple)" />
          Calendario de Vencimientos
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn-primary" onClick={today} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
            Hoy
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--card-bg)', padding: '5px 15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button className="icon-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '130px', textAlign: 'center' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button className="icon-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      <div className="calendar-container" style={{ flex: 1, backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Calendar Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8f9fa' }}>
          {dayNames.map(day => (
            <div key={day} style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(120px, auto)', flex: 1, overflowY: 'auto' }}>
          {/* Empty cells before start day */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', backgroundColor: '#fdfdfd' }}></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${dayNum}`;
            const dayStudents = studentsByDate[key] || [];
            const isToday = isCurrentMonth && dayNum === currentDayNum;

            return (
              <div key={`day-${dayNum}`} style={{ 
                borderRight: '1px solid var(--border-color)', 
                borderBottom: '1px solid var(--border-color)', 
                padding: '10px',
                backgroundColor: isToday ? '#f3f0ff' : 'transparent',
                display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ 
                    fontWeight: isToday ? 'bold' : 'normal', 
                    color: isToday ? 'var(--accent-purple)' : 'var(--text-main)',
                    display: 'inline-block',
                    width: '24px', height: '24px',
                    lineHeight: '24px', textAlign: 'center',
                    borderRadius: '50%',
                    backgroundColor: isToday ? 'var(--accent-purple)' : 'transparent',
                    color: isToday ? 'white' : 'inherit'
                  }}>
                    {dayNum}
                  </span>
                  {dayStudents.length > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#d32f2f', fontWeight: 'bold', backgroundColor: '#ffebee', padding: '2px 6px', borderRadius: '10px' }}>
                      {dayStudents.length} {dayStudents.length === 1 ? 'vencimiento' : 'vencimientos'}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {dayStudents.map(student => (
                    <div 
                      key={student.id} 
                      onClick={() => setSelectedStudent(student)}
                      style={{ 
                        fontSize: '0.8rem', 
                        padding: '4px 6px', 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderLeft: `3px solid ${student.pagosAtrasados > 0 && new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum) < actualToday ? '#d32f2f' : '#16c784'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={student.nombre}
                    >
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {student.nombre}
                      </span>
                      <button 
                        className={`action-btn ${student.estatus === 'Activo' || student.estatus === 'Completado' ? 'btn-deactivate' : 'btn-activate'}`}
                        style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const isActivating = student.estatus !== 'Activo' && student.estatus !== 'Completado';
                          if (isActivating && student.pagosAtrasados > 0) {
                            alert('No se puede activar al alumno sin registrar el pago de este mes.');
                            return;
                          }
                          if(onUpdateStudent) onUpdateStudent({...student, estatus: student.estatus === 'Activo' || student.estatus === 'Completado' ? 'Desactivado' : 'Activo'}); 
                        }}
                        title={student.estatus === 'Activo' || student.estatus === 'Completado' ? 'Desactivar' : 'Activar'}
                      >
                        <Power size={12} color={student.estatus === 'Activo' || student.estatus === 'Completado' ? '#d32f2f' : '#16c784'} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty cells after end day */}
          {Array.from({ length: (7 - ((startDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} style={{ borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', backgroundColor: '#fdfdfd' }}></div>
          ))}
        </div>

      </div>

      {selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent} 
          plataformas={plataformas}
          onClose={() => setSelectedStudent(null)}
          onUpdateStudent={(updated) => {
            if (onUpdateStudent) onUpdateStudent(updated);
            setSelectedStudent(null);
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

export default CalendarView;
