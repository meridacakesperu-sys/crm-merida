require('dotenv').config();
const cron = require('node-cron');
const { Resend } = require('resend');

// Reemplazar con tu clave API real de Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

/**
 * Función que simula la obtención de alumnos desde una base de datos (Ej: MySQL de WordPress o Supabase)
 * En la vida real, aquí harías una consulta SQL o usarías Prisma/Mongoose.
 */
const fetchStudentsFromDB = async () => {
  // Simulación de datos para demostración
  return [
    { nombre: 'María', email: 'maria@ejemplo.com', plan: 'Mensual', fechaPendiente: '02/07/26', pagosAtrasados: 0, ultimoPago: 160 },
    { nombre: 'Ana', email: 'ana@ejemplo.com', plan: 'Mensual', fechaPendiente: '01/07/26', pagosAtrasados: 0, ultimoPago: 160 },
    { nombre: 'Laura', email: 'laura@ejemplo.com', plan: 'Mensual', fechaPendiente: '30/06/26', pagosAtrasados: 1, ultimoPago: 160 },
    { nombre: 'Sofía', email: 'sofia@ejemplo.com', plan: 'Mensual', fechaPendiente: '29/06/26', pagosAtrasados: 1, ultimoPago: 160 },
  ];
};

const sendEmail = async (email, subject, htmlContent) => {
  try {
    const data = await resend.emails.send({
      from: 'Club VIP CRM <pagos@meridacakes.com>', // Debes verificar este dominio en Resend
      to: [email],
      subject: subject,
      html: htmlContent,
    });
    console.log(`✅ Correo enviado a ${email}: ${subject}`);
  } catch (error) {
    console.error(`❌ Error enviando correo a ${email}:`, error);
  }
};

const runDailyAutomations = async () => {
  console.log('Iniciando escaneo diario de pagos...');
  const students = await fetchStudentsFromDB();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Funciones de ayuda para calcular fechas
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const parseDateStr = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date();
    return new Date(2000 + parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);

  const formatShortDate = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  const strToday = formatShortDate(today);
  const strTomorrow = formatShortDate(tomorrow);
  const strYesterday = formatShortDate(yesterday);
  const strTwoDaysAgo = formatShortDate(twoDaysAgo);

  for (const student of students) {
    if (student.plan !== 'Mensual') continue;

    const firstName = student.nombre.split(' ')[0];
    const amount = `S/${student.ultimoPago}`;

    // REGLA 1: Día anterior
    if (student.fechaPendiente === strTomorrow) {
      await sendEmail(
        student.email,
        '¡Tu renovación en el Club VIP es mañana! 🎂',
        `<p>Hola ${firstName} buenos dias 🤗</p>
         <p>Para recordarte que mañana es tu renovación en el Club, son ${amount} al 927554437.</p>
         <p>Me confirmas para ir registrándolo😉</p>`
      );
    }
    
    // REGLA 2: Mismo día (Vencimiento)
    else if (student.fechaPendiente === strToday) {
      await sendEmail(
        student.email,
        'Hoy es tu fecha de renovación en el Club VIP ⭐',
        `<p>Hola ${firstName} buenos dias 🤗</p>
         <p>Para recordarte que hoy es tu renovación en el Club, son ${amount} al 927554437.</p>
         <p>Me confirmas para registrarlo lo antes posible😉</p>`
      );
    }
    
    // REGLA 3: 1 día después de vencimiento (Si no ha pagado)
    else if (student.fechaPendiente === strYesterday && student.pagosAtrasados > 0) {
      await sendEmail(
        student.email,
        'Recordatorio: Tu pago del Club VIP está pendiente ⚠️',
        `<p>Hola ${firstName}, esperamos que estés muy bien 🤗</p>
         <p>Notamos que tu pago de ${amount} venció ayer. Si ya lo realizaste por favor envíanos el comprobante, o puedes hacerlo al 927554437.</p>
         <p>¡No pierdas tu acceso al Club VIP! 😉</p>`
      );
    }

    // REGLA 4: 2 días después de vencimiento (Si no ha pagado)
    else if (student.fechaPendiente === strTwoDaysAgo && student.pagosAtrasados > 0) {
      await sendEmail(
        student.email,
        'Último aviso: Tu suscripción al Club VIP será pausada 🚫',
        `<p>Hola ${firstName} 😔</p>
         <p>Al no registrar el pago de tu cuota de ${amount}, tu acceso al Club VIP se encuentra temporalmente pausado.</p>
         <p>Puedes reactivarlo en cualquier momento enviando tu comprobante al 927554437.</p>
         <p>¡Esperamos verte de vuelta pronto!</p>`
      );
    }
  }

  console.log('Escaneo diario finalizado.');
};

// =========================================================================
// CONFIGURACIÓN DEL CRON (El reloj automático)
// =========================================================================
// Esta línea indica que la tarea correrá TODOS LOS DÍAS a las 8:00 AM
cron.schedule('0 8 * * *', () => {
  console.log('⏰ Ejecutando cron job de las 8:00 AM...');
  runDailyAutomations();
});

console.log('Servidor de automatización iniciado. Esperando a las 8:00 AM para disparar los correos.');

// Para probar la función inmediatamente descomenta la línea de abajo:
// runDailyAutomations();
