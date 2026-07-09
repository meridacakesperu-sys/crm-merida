const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = parseInt(today.getFullYear().toString().slice(2));

db.students = db.students.map(student => {
  if (student.estatus === 'Activo' || student.estatus === 'Completado') {
    if (student.fechaInicio) {
      const parts = student.fechaInicio.split('/');
      if (parts.length === 3) {
        let d = parts[0];
        let m = parts[1];
        let y = parseInt(parts[2]);

        if (student.plan === 'Mensual') {
          // Mantener el día, poner el mes actual y año actual
          student.fechaPendiente = `${d}/${String(currentMonth).padStart(2, '0')}/${currentYear}`;
        } else if (student.plan === 'Anual') {
          // Mantener el día y mes de inicio, pero mover el año al futuro o año actual
          let targetYear = currentYear;
          let inicioMes = parseInt(m);
          let inicioDia = parseInt(d);

          // Si el mes de inicio ya pasó este año, y el día también, le toca el próximo año? 
          // El usuario dijo "si pago en noviembre de 2025 le toca en la misma fecha de inicio pero en el 2026 y asi..."
          // Asumiremos que le toca la próxima ocurrencia.
          if (inicioMes < currentMonth || (inicioMes === currentMonth && inicioDia < today.getDate())) {
            targetYear = currentYear + 1; // Ya pasó su fecha este año, le toca el año que viene
          }
          student.fechaPendiente = `${d}/${m}/${targetYear}`;
        }
      }
    }
  }
  return student;
});

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
console.log('Fechas pendientes actualizadas en base a fechaInicio');
