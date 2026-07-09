const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const parseDate = (val) => {
  if (!val) return '';
  if (val instanceof Date) {
    const dd = String(val.getDate()).padStart(2, '0');
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const yy = String(val.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  }
  return String(val);
};

const getEmail = (val) => {
  if (!val) return '';
  if (typeof val === 'object' && val.text) return val.text.richText ? val.text.richText.map(r => r.text).join('') : String(val.text);
  if (typeof val === 'object' && val.hyperlink) return val.hyperlink.replace('mailto:', '').split('?')[0];
  return String(val).trim();
};

const mapColorToStatusAndPlan = (colorStr, rowPlanStr) => {
  const color = colorStr ? colorStr.toUpperCase() : 'BLANCO';
  let estatus = 'Activo';
  let plan = rowPlanStr || 'Mensual';
  let pagosAtrasados = 0;

  // Rojos (Ya no están)
  if (color.includes('FF0000') || color.includes('C00000') || color.includes('FF9999')) {
    estatus = 'Desactivado';
  } 
  // Morados (Año completo)
  else if (color.includes('800080') || color.includes('7030A0') || color.includes('9933FF') || color.includes('660066')) {
    plan = 'Anual';
    estatus = 'Completado';
  } 
  // Azules (Pago por partes)
  else if (color.includes('0000FF') || color.includes('00B0F0') || color.includes('3366FF') || color.includes('0070C0')) {
    plan = 'Cuotas';
  } 
  // Verdes (Mensuales al día)
  else if (color.includes('00FF00') || color.includes('92D050') || color.includes('00B050') || color.includes('33CC33')) {
    plan = 'Mensual';
  } 
  // Blancos / Sin color (Mensuales que faltan por pagar)
  else if (color === 'BLANCO' || color === 'FFFFFFFF') {
    plan = 'Mensual';
    estatus = 'Activo'; // O Pendiente según el CRM anterior
    pagosAtrasados = 1; // Para que las métricas de morosidad los detecten
  }

  return { estatus, plan, pagosAtrasados };
};

const migrate = async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('/tmp/alumnos.xlsx');
  const worksheet = workbook.worksheets[0];

  const students = [];
  let currentId = Date.now();

  // Iterate over all rows starting from row 3
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < 3) return; // Skip headers

    // Extract color from Estatus cell (column 1)
    let cellBg = null;
    const firstCell = row.getCell(1);
    if (firstCell.fill) {
      if (firstCell.fill.fgColor) cellBg = firstCell.fill.fgColor.argb;
      else if (firstCell.fill.bgColor) cellBg = firstCell.fill.bgColor.argb;
    }

    const planSheet = String(row.getCell(3).value || '');
    const { estatus, plan, pagosAtrasados } = mapColorToStatusAndPlan(cellBg, planSheet);

    const nombre = String(row.getCell(5).value || '').trim();
    if (!nombre) return;

    const emailRaw = row.getCell(7).value;
    const email = getEmail(emailRaw);
    const numero = String(row.getCell(8).value || '').trim();
    const pais = String(row.getCell(9).value || '').trim();
    const plataforma = String(row.getCell(10).value || 'Otro').trim();
    const fechaInicioRaw = row.getCell(4).value;
    const fechaPendienteRaw = row.getCell(15).value;

    const student = {
      id: currentId++,
      nombre: nombre,
      email: email,
      usuario: email ? email.split('@')[0] : nombre.replace(/\s+/g, '').toLowerCase(),
      password: Math.random().toString(36).slice(-8), 
      numero: numero,
      pais: pais,
      plan: plan,
      plataforma: plataforma,
      otraPlataforma: '',
      cantidadCuotas: plan === 'Cuotas' ? 3 : null,
      montoPago: '60', // Default
      monedaPago: 'Soles',
      fechaPago: parseDate(fechaInicioRaw), 
      fechaInicio: parseDate(fechaInicioRaw),
      fechaPendiente: parseDate(fechaPendienteRaw),
      estatus: estatus,
      pagosAtrasados: pagosAtrasados,
      historialPagos: []
    };

    students.push(student);
  });

  // Ordenar por fecha de inicio (más antiguo primero, o más nuevo primero?)
  // El usuario dice "en el orden de fecha en que iniciaron", vamos a ordenarlos parseando fechaInicio (DD/MM/YY)
  students.sort((a, b) => {
    const parseSortDate = (d) => {
      if (!d) return 0;
      const parts = d.split('/');
      if (parts.length === 3) return new Date(`20${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
      return 0;
    };
    return parseSortDate(a.fechaInicio) - parseSortDate(b.fechaInicio);
  });

  const db = { students };
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  console.log(`✅ Migración completada: ${students.length} alumnos procesados.`);
};

migrate().catch(console.error);
