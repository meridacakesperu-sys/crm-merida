require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { Resend } = require('resend');
const { syncUserToWP } = require('./wordpress');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ Conectado a MongoDB Atlas exitosamente');
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err);
});

// --- MIGRATION ENDPOINT ---
app.get('/api/migrate-now', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const DB_FILE = path.join(__dirname, 'db.json');
    
    if (!fs.existsSync(DB_FILE)) {
      return res.status(404).json({ error: 'No se encontró db.json' });
    }
    const raw = fs.readFileSync(DB_FILE);
    const db = JSON.parse(raw);
    const students = db.students || [];
    
    if (students.length === 0) {
      return res.status(400).json({ error: 'db.json vacío' });
    }
    
    await Student.deleteMany({});
    const result = await Student.insertMany(students);
    
    res.json({ success: true, message: `Migrados ${result.length} estudiantes exitosamente a MongoDB Atlas.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

const createEmailTemplate = (title, content) => {
  const logoSrc = 'https://d.uguu.se/RmZaFeyJ.png';
  return `
    <div style="background-color: #f8f9fa; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        
        <!-- HEADER -->
        <div style="text-align: center; padding: 30px 20px; border-bottom: 2px solid #fce4ec;">
          ${logoSrc ? `<img src="${logoSrc}" alt="Club VIP Logo" style="max-width: 220px; height: auto;" />` : `<h1 style="color: #d81b60; margin: 0;">Club VIP</h1>`}
        </div>

        <!-- BODY -->
        <div style="padding: 40px 30px; color: #4a4a4a; line-height: 1.6; font-size: 16px;">
          <h2 style="color: #d81b60; font-size: 24px; margin-top: 0; margin-bottom: 20px;">${title}</h2>
          ${content}
        </div>

        <!-- FOOTER -->
        <div style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
          <p style="margin: 0; font-size: 14px; color: #888888;">¿Tienes dudas o necesitas información de pagos?</p>
          <a href="https://wa.link/llvtid" style="display: inline-block; margin-top: 15px; background-color: #25D366; color: white; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3);">
            📲 Contactar por WhatsApp
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #aaaaaa;">© ${new Date().getFullYear()} Mérida Cakes. Todos los derechos reservados.</p>
        </div>

      </div>
    </div>
  `;
};

// --- EMAIL HELPER FUNCTIONS ---
const sendEmail = async (email, subject, htmlContent) => {
  if (!email || email === '') return;
  try {
    const { data, error } = await resend.emails.send({
      from: 'Club VIP <hola@meridacakes.com>', // Verificado en Resend
      to: [email],
      subject: subject,
      html: htmlContent,
    });
    if (error) {
      console.error(`❌ Error de Resend enviando correo a ${email}:`, error);
      return;
    }
    console.log(`✅ Correo enviado a ${email}: ${subject}`);
  } catch (err) {
    console.error(`❌ Excepción enviando correo a ${email}:`, err.message);
  }
};

const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

// --- API ENDPOINTS ---

// GET: Listar todos los estudiantes
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ id: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo estudiantes', error });
  }
});

// POST: Crear nuevo estudiante y enviar Bienvenida
app.post('/api/students', async (req, res) => {
  try {
    const newStudentData = { id: Date.now(), ...req.body };
    
    if (newStudentData.email) {
      const password = newStudentData.password || generatePassword();
      const usuario = newStudentData.usuario || newStudentData.email.split('@')[0];
      newStudentData.password = password;
      newStudentData.usuario = usuario;
      
      // Sincronizar con WordPress antes de guardar
      const wpId = await syncUserToWP(newStudentData);
      if (wpId) newStudentData.wpId = wpId;
    }
    
    const newStudent = new Student(newStudentData);
    await newStudent.save();

    // Enviar correo de Bienvenida
    if (newStudent.email) {
      const firstName = newStudent.nombre.split(' ')[0] || 'Alumno';
      
      const bodyContent = `
          <p>Hola <strong>${firstName}</strong>,</p>
          <p>Tu acceso ha sido creado exitosamente. Estamos muy felices de tenerte con nosotros.</p>
          <div style="background: #fce4ec; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #d81b60;">
            <p style="margin:0 0 10px 0;"><strong>Tus credenciales de acceso:</strong></p>
            <p style="margin:5px 0 0 0;">👤 Usuario: <strong>${newStudent.usuario}</strong></p>
            <p style="margin:5px 0 0 0;">🔑 Contraseña: <strong>${newStudent.password}</strong></p>
          </div>
          <p>Puedes entrar a la plataforma en cualquier momento haciendo clic en el siguiente enlace:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://club.meridacakes.com/" style="background-color: #1e88e5; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">👉 Ingresar al Club VIP</a>
          </p>
          <p>Recuerda guardar estos datos en un lugar seguro. ¡Disfruta de todo el contenido!</p>
      `;
      
      const emailHtml = createEmailTemplate('¡Bienvenido/a al Club VIP! 🎉', bodyContent);
      await sendEmail(newStudent.email, '¡Tu acceso al Club VIP está listo! 🎂', emailHtml);
    }

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error creando estudiante', error });
  }
});

// PUT: Actualizar estudiante
app.put('/api/students/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Obtener estudiante actual
    const student = await Student.findOne({ id: id });
    if (!student) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    // Actualizar datos
    Object.assign(student, req.body);
    
    // Sincronizar con WordPress
    if (student.email) {
      const wpId = await syncUserToWP(student);
      if (wpId) student.wpId = wpId;
    }

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando estudiante', error });
  }
});

// POST: Reenviar credenciales manualmente
app.post('/api/students/:id/send-credentials', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = await Student.findOne({ id: id });
    
    if (student && student.email) {
      const password = student.password || generatePassword();
      const usuario = student.usuario || student.email.split('@')[0];
      const firstName = student.nombre.split(' ')[0] || 'Alumno';
      
      // Si no tenía contraseña/usuario, guardarlos en BD
      if (!student.password || !student.usuario) {
        student.password = password;
        student.usuario = usuario;
        await student.save();
      }
      
      const bodyContent = `
          <p>¡Hola <strong>${firstName}</strong>! Esperamos que estés teniendo un día increíble 🎂</p>
          <p>A pedido tuyo, te estamos enviando este recordatorio amistoso con tus datos de acceso al Club VIP para que puedas seguir disfrutando de todas las clases y contenido exclusivo.</p>
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #1e88e5;">
            <p style="margin:0 0 10px 0; color: #1565c0;"><strong>Tus credenciales de acceso:</strong></p>
            <p style="margin:5px 0 0 0;">👤 Usuario: <strong>${usuario}</strong></p>
            <p style="margin:5px 0 0 0;">🔑 Contraseña: <strong>${password}</strong></p>
          </div>
          <p>Haz clic en el siguiente enlace para iniciar sesión cuando gustes:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://club.meridacakes.com/" style="background-color: #d81b60; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">👉 Ir al Portal del Club VIP</a>
          </p>
          <p>¡Te esperamos adentro para seguir aprendiendo juntos!</p>
      `;
      
      const emailHtml = createEmailTemplate('Tus accesos del Club VIP 🔐', bodyContent);
      await sendEmail(student.email, 'Recordatorio de tus credenciales del Club VIP 🔐', emailHtml);
      res.json({ message: 'Correo enviado con éxito' });
    } else {
      res.status(404).json({ message: 'Alumno no encontrado o sin correo registrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error enviando credenciales', error });
  }
});

// DELETE: Eliminar estudiante
app.delete('/api/students/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await Student.deleteOne({ id: id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando estudiante', error });
  }
});


// --- CRON JOBS AUTOMATIONS ---

const runDailyAutomations = async () => {
  console.log('Iniciando escaneo diario de pagos...');
  try {
    const students = await Student.find({ estatus: 'Activo', plan: { $in: ['Mensual', 'Cuotas'] } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const tomorrow = addDays(today, 1);
    const dayAfterTomorrow = addDays(today, 2);
    const yesterday = addDays(today, -1);

    const formatShortDate = (date) => {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yy = String(date.getFullYear()).slice(-2);
      return `${dd}/${mm}/${yy}`;
    };

    const strToday = formatShortDate(today);
    const strTomorrow = formatShortDate(tomorrow);
    const strDayAfterTomorrow = formatShortDate(dayAfterTomorrow);
    const strYesterday = formatShortDate(yesterday);

    for (const student of students) {
      if (!student.fechaPendiente || !student.email) continue;

      const firstName = student.nombre.split(' ')[0] || 'Alumno';
      const amount = `$${student.montoPago || 0}`; 

      // REGLA 1: 2 días antes
      if (student.fechaPendiente === strDayAfterTomorrow) {
        await sendEmail(
          student.email,
          'Aviso: Tu renovación del Club VIP se acerca 🎂',
          createEmailTemplate('Renovación Próxima', `
            <p>Hola <strong>${firstName}</strong> buenos días 🤗</p>
            <p>Te escribimos para recordarte que pasado mañana es tu fecha de renovación en el Club por el monto de <strong>${amount}</strong>.</p>
            <p>Puedes ir realizando tu pago para que no haya interrupciones en tu acceso. ¡Gracias por seguir aprendiendo con nosotros!</p>
          `)
        );
      }
      
      // REGLA 2: 1 día antes (Mañana)
      else if (student.fechaPendiente === strTomorrow) {
        await sendEmail(
          student.email,
          '¡Tu renovación en el Club VIP es mañana! ⭐',
          createEmailTemplate('Renovación Mañana', `
            <p>Hola <strong>${firstName}</strong> buenos días 🤗</p>
            <p>Para recordarte que mañana es tu renovación en el Club, el monto es <strong>${amount}</strong>.</p>
            <p>Me confirmas cuando realices la transferencia para ir registrándolo en el sistema 😉</p>
          `)
        );
      }
      
      // REGLA 3: Mismo día
      else if (student.fechaPendiente === strToday) {
        await sendEmail(
          student.email,
          'Hoy es tu fecha de renovación en el Club VIP 💳',
          createEmailTemplate('Renovación Hoy', `
            <p>Hola <strong>${firstName}</strong> buenos días 🤗</p>
            <p>Para recordarte que hoy es tu fecha exacta de renovación en el Club, el monto es <strong>${amount}</strong>.</p>
            <p>Por favor envíanos tu comprobante para registrarlo lo antes posible y que sigas disfrutando tu acceso 😉</p>
          `)
        );
      }
      
      // REGLA 4: 1 día después (Si sigue debiendo)
      else if (student.fechaPendiente === strYesterday && student.pagosAtrasados > 0) {
        await sendEmail(
          student.email,
          'Recordatorio: Tu pago del Club VIP está pendiente ⚠️',
          createEmailTemplate('Pago Pendiente', `
            <p>Hola <strong>${firstName}</strong>, esperamos que estés muy bien 🤗</p>
            <p>Notamos que tu pago de <strong>${amount}</strong> venció ayer. Si ya lo realizaste por favor envíanos el comprobante para actualizarlo.</p>
            <p>De lo contrario, recuerda que tu acceso será pausado muy pronto. ¡Estamos a la orden para cualquier duda! 😉</p>
          `)
        );
      }
    }

    console.log('Escaneo diario finalizado.');
  } catch (error) {
    console.error('Error en escaneo diario:', error);
  }
};

// Ejecutar todos los días a las 8:00 AM
cron.schedule('0 8 * * *', () => {
  console.log('⏰ Ejecutando cron job de las 8:00 AM...');
  runDailyAutomations();
});

// Endpoint especial para probar el cron job manualmente en cualquier momento
app.get('/api/test-cron', async (req, res) => {
  console.log('🛠️ Ejecutando prueba manual de las automatizaciones...');
  await runDailyAutomations();
  res.send('<h1>Prueba enviada</h1><p>Revisa la consola del servidor y tu correo electrónico. Si algún alumno cumplía las reglas de fecha, se le envió un correo.</p>');
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
